"""
Standalone test script for Wati JSON generation.

Run from the backend directory with the venv activated:
    cd backend && source venv/bin/activate && python test_json_generation.py

This script:
  1. Calls the Gemini AI with two real prompts
  2. Validates the generated JSON against WATI schema rules
  3. Saves importable .json files (test_output_1.json, test_output_2.json)
     that can be uploaded directly into WATI → Flows → Import Flow
  4. Prints a PASS/FAIL report
"""

import asyncio
import json
import os
import sys
import re

# ── Make sure we can import from the backend ────────────────────────────────
sys.path.insert(0, os.path.dirname(__file__))

from config import GEMINI_API_KEY, GEMINI_MODEL
from services.ai_engine import generate_with_gemini

# ── Test prompts ──────────────────────────────────────────────────────────────
TEST_CASES = [
    {
        "label": "Simple Welcome Flow",
        "output_file": "test_output_1.json",
        "prompt": (
            "Create a welcome flow that greets the user, asks for their name, "
            "and then sends a personalised thank-you message."
        ),
    },
    {
        "label": "Customer Support Flow (with InteractiveList)",
        "output_file": "test_output_2.json",
        "prompt": (
            "Create a customer support bot that asks for the issue type using an "
            "interactive list with three options: Billing, Technical, General. "
            "Each option routes to a separate message. End the flow by assigning "
            "the conversation to an agent."
        ),
    },
]


# ── Validation helpers ────────────────────────────────────────────────────────
NODE_ID_PREFIXES = {
    "Question":              "main_question-",
    "Message":               "main_message-",
    "InteractiveList":       "main_list-",
    "InteractiveCtaUrl":     "main_interactiveUrlButton-",
    "UpdateAttribute":       "main_updateAttribute-",
    "Subscription":          "main_subscription-",
    "UpdateChatTopicName":   "main_updateChatTopicName-",
    "InvokeFlow":            "main_invokeFlow-",
    "AssignAgent":           "main_assignAgent-",
    "UpdateChatStatus":      "main_updateChatStatus-",
    "MessageTemplate":       "main_messageTemplate-",
    "TimeDelay":             "main_timeDelay-",
    "Webhook":               "main_webhook-",
    "GoogleSpreadsheet":     "main_googleSpreadsheet-",
    "InteractiveProductList": "main_sets-",
    "InteractiveProduct":    "main_product-",
}

HTML_TAG_RE = re.compile(r"<[a-zA-Z]")


def validate(data: dict) -> list[str]:
    """
    Validate the generated JSON against WATI schema rules.
    Returns a list of failure messages (empty = all passed).
    """
    failures = []

    # ── Top-level structure ─────────────────────────────────────────────
    for field in ("name", "flowNodes", "flowEdges"):
        if field not in data:
            failures.append(f"MISSING top-level field: '{field}'")

    nodes = data.get("flowNodes", [])
    edges = data.get("flowEdges", [])

    if not isinstance(nodes, list) or len(nodes) == 0:
        failures.append("'flowNodes' must be a non-empty list")
        return failures  # cannot validate further

    # ── Node-level checks ───────────────────────────────────────────────
    start_count = 0
    node_ids: set[str] = set()

    for i, node in enumerate(nodes):
        prefix = f"Node[{i}] id={node.get('id', '?')!r}"

        for req in ("id", "flowNodeType", "isStartNode", "flowNodePosition"):
            if req not in node:
                failures.append(f"{prefix}: missing required field '{req}'")

        nid = node.get("id", "")
        ntype = node.get("flowNodeType", "")
        pos = node.get("flowNodePosition", {})

        # id prefix matches type
        expected_prefix = NODE_ID_PREFIXES.get(ntype)
        if expected_prefix and not nid.startswith(expected_prefix):
            failures.append(
                f"{prefix}: id should start with '{expected_prefix}' for type '{ntype}'"
            )

        # 5-char alphanumeric suffix
        suffix = nid.split("-")[-1] if "-" in nid else ""
        if len(suffix) != 5 or not suffix.isalnum():
            failures.append(
                f"{prefix}: id suffix '{suffix}' should be exactly 5 alphanumeric chars"
            )

        # isStartNode
        if node.get("isStartNode") is True:
            start_count += 1

        # flowNodePosition values must be strings
        for axis in ("posX", "posY"):
            val = pos.get(axis)
            if val is not None and not isinstance(val, str):
                failures.append(
                    f"{prefix}: flowNodePosition.{axis} must be a string, got {type(val).__name__}"
                )

        # flowReplies HTML check
        for reply in node.get("flowReplies", []):
            d = reply.get("data", "")
            if d and not HTML_TAG_RE.search(d):
                failures.append(
                    f"{prefix}: flowReplies data '{d[:60]}' should contain HTML tags"
                )

        # InteractiveList row nodeResultId check (collected after building node_ids)
        node_ids.add(nid)

    if start_count == 0:
        failures.append("No node has 'isStartNode': true (exactly one required)")
    elif start_count > 1:
        failures.append(f"{start_count} nodes have 'isStartNode': true (only one allowed)")

    # ── InteractiveList row references ──────────────────────────────────
    for node in nodes:
        if node.get("flowNodeType") == "InteractiveList":
            for section in node.get("interactiveListSections", []):
                for row in section.get("rows", []):
                    rid = row.get("nodeResultId", "")
                    if rid and rid not in node_ids:
                        failures.append(
                            f"InteractiveList row nodeResultId '{rid}' not found in nodes"
                        )

    # ── Edge checks ─────────────────────────────────────────────────────
    for i, edge in enumerate(edges):
        prefix = f"Edge[{i}]"

        eid = edge.get("id", "")
        if eid and not eid.startswith("reactflow__edge-"):
            failures.append(f"{prefix}: id '{eid}' should start with 'reactflow__edge-'")

        src = edge.get("sourceNodeId", "")
        tgt = edge.get("targetNodeId", "")

        if not src:
            failures.append(f"{prefix}: missing 'sourceNodeId'")
        else:
            src_base = src.split("__")[0]
            if src_base not in node_ids:
                failures.append(f"{prefix}: sourceNodeId '{src}' references unknown node")

        if not tgt:
            failures.append(f"{prefix}: missing 'targetNodeId'")
        elif tgt not in node_ids:
            failures.append(f"{prefix}: targetNodeId '{tgt}' references unknown node")

    return failures


# ── Main test runner ─────────────────────────────────────────────────────────
async def run_tests():
    print("=" * 70)
    print("  WATI JSON Generation Test")
    print(f"  Model: {GEMINI_MODEL}")
    print("=" * 70)

    overall_pass = True

    for tc in TEST_CASES:
        label = tc["label"]
        prompt = tc["prompt"]
        out_file = tc["output_file"]

        print(f"\n{'─'*70}")
        print(f"TEST: {label}")
        print(f"PROMPT: {prompt[:80]}...")
        print("Calling Gemini AI... (this may take 10–30 seconds)")

        data = await generate_with_gemini(prompt, retries=3)

        if data is None:
            print("  ❌  FAIL — AI returned no data (check GEMINI_API_KEY or rate limits)")
            overall_pass = False
            continue

        # Save output file
        out_path = os.path.join(os.path.dirname(__file__), out_file)
        with open(out_path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"  💾  Saved: {out_file}")

        # Print summary
        nodes = data.get("flowNodes", [])
        edges = data.get("flowEdges", [])
        print(f"  📊  Nodes: {len(nodes)}, Edges: {len(edges)}")

        # Validate
        failures = validate(data)
        if failures:
            print(f"  ❌  FAIL — {len(failures)} validation error(s):")
            for f in failures:
                print(f"       • {f}")
            overall_pass = False
        else:
            print("  ✅  PASS — All schema checks passed")

        # Print node summary
        print("  🗂️  Nodes generated:")
        for node in nodes:
            start = " [START]" if node.get("isStartNode") else ""
            print(f"       {node.get('id', '?')} ({node.get('flowNodeType', '?')}){start}")

    print(f"\n{'='*70}")
    if overall_pass:
        print("🎉  ALL TESTS PASSED")
        print()
        print("Next step — import into Wati:")
        print("  1. Log in to your Wati account")
        print("  2. Go to Flows → Import Flow")
        print("  3. Upload 'test_output_1.json' and 'test_output_2.json'")
        print("  4. Verify the flows render correctly in the flow builder")
    else:
        print("💥  SOME TESTS FAILED — see errors above")
    print("=" * 70)

    return overall_pass


if __name__ == "__main__":
    success = asyncio.run(run_tests())
    sys.exit(0 if success else 1)
