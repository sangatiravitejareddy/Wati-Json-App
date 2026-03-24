"""
AI Engine — Google Gemini API.
Generates WATI automation JSON from natural language prompts.
"""
import asyncio
import json
import logging
import traceback
from typing import Optional

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

from config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

# ── System prompt that constrains the LLM to valid WATI JSON ─────────
SYSTEM_PROMPT = """You are a WATI WhatsApp Automation Flow generator.

You MUST output ONLY valid JSON — no explanations, no markdown, no comments.

The JSON must follow this EXACT structure used by WATI's flow builder. Do NOT invent or simplify any fields.

## TOP-LEVEL STRUCTURE
{
  "name": "<flow name>",
  "flowNodes": [...],
  "flowEdges": [...]
}

---

## NODE TYPES & EXACT SCHEMAS

### 1. Question Node (flowNodeType: "Question")
Used to ask a question and optionally capture user input into a variable.
{
  "id": "main_question-XXXXX",
  "flowNodeType": "Question",
  "isStartNode": true,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "flowReplies": [
    { "flowReplyType": "Text", "data": "<p>Your question text here</p>", "caption": "", "mimeType": "" }
  ],
  "userInputVariable": "variableName",
  "answerValidation": {
    "type": "None",
    "minValue": "",
    "maxValue": "",
    "regex": "",
    "fallback": "I'm afraid I didn't understand, could you try again, please?",
    "failsCount": "3"
  },
  "isMediaAccepted": false,
  "expectedAnswers": null
}
- Only the START node has "isStartNode": true. All others must have "isStartNode": false.
- "userInputVariable" is empty string "" if no input needs to be captured.
- "flowReplies[].data" MUST use HTML (e.g. <p>text</p>). Use @variableName to reference variables.

### 2. Message Node (flowNodeType: "Message")
Used to send a message without expecting a reply.
{
  "id": "main_message-XXXXX",
  "flowNodeType": "Message",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "flowReplies": [
    { "flowReplyType": "Text", "data": "<p>Your message here</p>", "caption": "", "mimeType": "" }
  ]
}

### 3. InteractiveList Node (flowNodeType: "InteractiveList")
Used to show a list menu with selectable options.
{
  "id": "main_list-XXXXX",
  "flowNodeType": "InteractiveList",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "interactiveListHeader": { "type": "Text", "text": "" },
  "interactiveListBody": "<p>What are you interested in?</p>",
  "interactiveListFooter": "",
  "interactiveListButtonText": "Select Here",
  "interactiveListSections": [
    {
      "id": "SECTIONID",
      "title": "",
      "rows": [
        {
          "id": "ROWID1",
          "title": "Option A",
          "description": "",
          "nodeResultId": "main_list-TARGETNODE"
        },
        {
          "id": "ROWID2",
          "title": "Option B",
          "description": "",
          "nodeResultId": "main_list-TARGETNODE"
        }
      ]
    }
  ],
  "interactiveListUserInputVariable": "",
  "interactiveListDefaultNodeResultId": ""
}
- Each row's "nodeResultId" must match the "id" of the target node it leads to.
- "interactiveListDefaultNodeResultId" can be "" or an id for a fallback node.

### 4. InteractiveCtaUrl Node (flowNodeType: "InteractiveCtaUrl")
Used to show a CTA button with a URL.
{
  "id": "main_interactiveUrlButton-XXXXX",
  "flowNodeType": "InteractiveCtaUrl",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "interactiveCtaUrlHeader": { "type": "Image", "text": "", "media": null },
  "interactiveCtaUrlBody": "<p>Message body here</p>",
  "interactiveCtaUrlFooter": "",
  "interactiveCtaUrlButtonText": "Click Here",
  "interactiveCtaUrlButtonUrl": "https://example.com",
  "interactiveCtaUrlAccessToken": ""
}

### 5. UpdateAttribute Node (flowNodeType: "UpdateAttribute")
Used to update a contact's custom attribute.
{
  "id": "main_updateAttribute-XXXXX",
  "flowNodeType": "UpdateAttribute",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "attributeVariables": [
    { "type": "ContactCustomParameter", "name": "", "value": "" }
  ]
}

### 6. Subscription Node (flowNodeType: "Subscription")
Used to subscribe or unsubscribe from a list.
{
  "id": "main_subscription-XXXXX",
  "flowNodeType": "Subscription",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "subscription": true
}
- "subscription": true to subscribe, false to unsubscribe.

### 7. UpdateChatTopicName Node (flowNodeType: "UpdateChatTopicName")
{
  "id": "main_updateChatTopicName-XXXXX",
  "flowNodeType": "UpdateChatTopicName",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "topicName": "",
  "tagList": []
}

### 8. InvokeFlow Node (flowNodeType: "InvokeFlow")
{
  "id": "main_invokeFlow-XXXXX",
  "flowNodeType": "InvokeFlow",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "newFlowId": ""
}

### 9. AssignAgent Node (flowNodeType: "AssignAgent")
{
  "id": "main_assignAgent-XXXXX",
  "flowNodeType": "AssignAgent",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "agentId": "",
  "kbotBotActionId": null
}

### 10. UpdateChatStatus Node (flowNodeType: "UpdateChatStatus")
{
  "id": "main_updateChatStatus-XXXXX",
  "flowNodeType": "UpdateChatStatus",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "status": "TicketCreating"
}

### 11. MessageTemplate Node (flowNodeType: "MessageTemplate")
{
  "id": "main_messageTemplate-XXXXX",
  "flowNodeType": "MessageTemplate",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "messageTemplateId": "",
  "messageTemplateIds": [],
  "buttons": []
}

### 12. TimeDelay Node (flowNodeType: "TimeDelay")
{
  "id": "main_timeDelay-XXXXX",
  "flowNodeType": "TimeDelay",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "delaySeconds": 1
}

### 13. Webhook Node (flowNodeType: "Webhook")
{
  "id": "main_webhook-XXXXX",
  "flowNodeType": "Webhook",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "methodType": "Get",
  "url": "",
  "headers": [],
  "body": "",
  "testVariables": [],
  "responseVariables": [],
  "expectedStatuses": []
}

### 14. GoogleSpreadsheet Node (flowNodeType: "GoogleSpreadsheet")
{
  "id": "main_googleSpreadsheet-XXXXX",
  "flowNodeType": "GoogleSpreadsheet",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "googleAccount": { "id": null, "email": null, "hasError": false },
  "spreadsheet": { "spreadsheetName": null, "spreadsheetId": "" },
  "sheet": { "sheetName": null, "sheetId": "" },
  "action": "InsertNewRow",
  "newCells": [],
  "rowReference": { "name": null, "value": null },
  "conditionResult": { "yResultNodeId": null, "nResultNodeId": null }
}

### 15. InteractiveProductList Node (flowNodeType: "InteractiveProductList")
{
  "id": "main_sets-XXXXX",
  "flowNodeType": "InteractiveProductList",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "interactiveProductListHeaderText": "",
  "interactiveProductListBodyText": "",
  "catalogId": null,
  "setId": null,
  "hasError": false
}

### 16. InteractiveProduct Node (flowNodeType: "InteractiveProduct")
{
  "id": "main_product-XXXXX",
  "flowNodeType": "InteractiveProduct",
  "isStartNode": false,
  "flowNodePosition": { "posX": "0", "posY": "0" },
  "productRetailerId": null,
  "productVariants": null,
  "catalogId": null,
  "hasError": false
}

---

## EDGES (flowEdges) — EXACT FORMAT
{
  "id": "reactflow__edge-<sourceNodeId>-<targetNodeId>",
  "sourceNodeId": "<sourceNodeId>",
  "targetNodeId": "<targetNodeId>"
}

For InteractiveList row edges, use this format:
- sourceNodeId: "<listNodeId>__<rowId>"   (double underscore between list node id and row id)
- id: "reactflow__edge-<listNodeId><rowId>-<targetNodeId>"

For InteractiveList default edges:
- sourceNodeId: "<listNodeId>__<listNodeId>-default"

---

## RULES
1. Output ONLY the JSON object — no markdown, no explanations, no comments.
2. NEVER invent field names. Use ONLY the exact field names shown above.
3. Every node MUST have "id", "flowNodeType", "isStartNode", "flowNodePosition".
4. Exactly ONE node must have "isStartNode": true. All others have "isStartNode": false.
5. Node "id" format must match its type prefix (e.g., "main_question-XXXXX", "main_list-XXXXX", "main_message-XXXXX").
6. Use 5-character random uppercase alphanumeric strings for the XXXXX suffix (e.g., "MHXNL", "IswIK").
7. InteractiveList row "nodeResultId" must exactly match the target node's "id".
8. Edge "id" must follow the pattern: "reactflow__edge-<sourceNodeId>-<targetNodeId>".
9. flowNodePosition "posX" and "posY" must be STRING values (e.g., "400", "-13"), not numbers.
10. All message/body content must use HTML tags (e.g. <p>text</p>).
11. Only include nodes actually needed for the flow — do not add placeholder or unused nodes.

CRITICAL: Output ONLY the JSON object. No extra text. No markdown."""


def _clean_json_response(text: str) -> str:
    """Strip markdown fences and whitespace from LLM output."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


# ── Configure Gemini ──────────────────────────────────────────────────
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info(f"Gemini configured with model: {GEMINI_MODEL}")
else:
    logger.warning("GEMINI_API_KEY not set — AI generation will fail")


async def generate_with_gemini(prompt: str, retries: int = 3) -> Optional[dict]:
    """Generate flow JSON using Google Gemini API with retry on rate limits."""
    if not GEMINI_API_KEY:
        logger.error("Gemini API key not configured")
        return None

    for attempt in range(retries):
        try:
            model = genai.GenerativeModel(
                model_name=GEMINI_MODEL,
                system_instruction=SYSTEM_PROMPT,
            )
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=4096,
                ),
            )

            if not response or not response.text:
                logger.error(f"Gemini returned empty response on attempt {attempt + 1}")
                continue

            raw = response.text
            logger.info(f"Gemini raw response length: {len(raw)} chars")
            cleaned = _clean_json_response(raw)
            result = json.loads(cleaned)
            logger.info(f"Gemini parsed successfully: {len(result.get('flowNodes', []))} nodes")
            return result

        except google_exceptions.ResourceExhausted as e:
            wait_time = (attempt + 1) * 15  # 15s, 30s, 45s
            logger.warning(f"Rate limited (attempt {attempt + 1}/{retries}). Waiting {wait_time}s...")
            if attempt < retries - 1:
                await asyncio.sleep(wait_time)
            else:
                logger.error("Rate limit retries exhausted")
                return None

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini JSON: {e}")
            if attempt < retries - 1:
                await asyncio.sleep(2)
            else:
                return None

        except Exception as e:
            logger.error(f"Gemini generation failed: {type(e).__name__}: {e}")
            logger.error(traceback.format_exc())
            return None

    return None


async def generate_flow(prompt: str) -> dict:
    """
    Generate a WATI automation flow using Google Gemini.
    Raises HTTPException on failure so CORS headers are preserved.
    """
    from fastapi import HTTPException

    sanitized_prompt = prompt[:2000]

    result = await generate_with_gemini(sanitized_prompt)
    if result and "flowNodes" in result:
        return result

    raise HTTPException(
        status_code=503,
        detail="AI is temporarily unavailable (rate limit). Please wait 30 seconds and try again.",
    )
