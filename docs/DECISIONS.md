# Decisions log

## 2026-11-25: Plan to change AI model and text limit (not yet done)
- **Status:** Planned. No code or model change made yet.
- **What we plan to change:** Model from [current model name] to openai/gpt-oss-120b. Text limit from 12,000 to [number to decide] characters.
- **Why:** The 12,000-character limit reads only about a quarter of long policies, so most of each policy is never analyzed.
- **Test plan:** Run 5 long policies on the dev branch, once with the current setup and once with the new model. Check that every quote matches the policy word for word, and that no major risk clause disappears.
- **Pass rule:** Make the change only if quotes still verify and findings are the same or better on most policies.
- **Owner decision:** Shahad Alrashoud, owner. Date: 2026/11/25.
- **Results:** To be filled in after testing.
- **Known limits:** Until the change is made, long policies are capped at 12,000 characters, and results show how much was read.