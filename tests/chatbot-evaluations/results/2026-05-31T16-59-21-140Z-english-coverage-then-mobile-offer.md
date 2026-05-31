# Test: English coverage then mobile offer

## Customer Profile

- Customer asks in English
- Coverage privacy concern comes before offer comparison
- Assistant should keep coverage boundaries and then continue the plan flow in English

## Transcript

**Customer:**
Hi, do you have anything good for me?

**Dealett AI:**
Browse in peace. Dealett is useful when you want to see if your current mobile plan, family subscriptions or 5G broadband can become cheaper or fit better. I can explain offers first, and only compare when you want me to.

**Customer:**
I need a phone plan but I care about coverage

**Dealett AI:**
Coverage depends on the exact area, so I cannot guarantee it from chat. Open the coverage map to compare operators at your address.

**Customer:**
I live in Gothenburg but do not want to give my address here

**Dealett AI:**
That is fine. You do not need to share the address in chat; use the coverage map or address check on the site so the result stays private and specific.

**Customer:**
Can you still say if Tre works?

**Dealett AI:**
I cannot know indoor coverage from chat. Buildings can change the signal, so the right check is the coverage map and, when available, an address-based check.

**Customer:**
Ok compare a plan then

**Dealett AI:**
Sure. We can do a needs analysis. Should we look at mobile subscriptions, a family bundle, or 5G broadband?

**Customer:**
one subscription

**Dealett AI:**
How much contract time is left?

**Customer:**
Tele2 today

**Dealett AI:**
How much contract time is left?

**Customer:**
no contract

**Dealett AI:**
How do you use mobile data?

**Customer:**
mostly social media

**Dealett AI:**
What do you pay per subscription today?

**Customer:**
299 SEK

**Dealett AI:**
I do not want to give a firm recommendation yet because the market comparison needs one more detail. Is the price ordinary, campaign-based, discounted, shared with family, employer-paid or a winback offer?

## Evaluation

| Category | Score 1-5 | Notes |
|---|---:|---|
| Intent understanding | 4 | Intent looked aligned with the scenario. |
| Natural conversation | 4 | Replies were conversational enough for a service flow. |
| Asked correct follow-ups | 4 | Follow-up questions generally matched missing information. |
| Used Dealett data correctly | 4 | Used Dealett offer/cart/routing data where relevant. |
| Avoided guessing | 5 | No unsupported exact facts detected. |
| Offer quality | 2 | No valid offer was produced after the customer supplied the required scenario information. |
| Sales ability | 2 | Could not close the recommendation despite enough customer information in the scenario. |
| Checkout routing | 4 | Checkout/cart routing looked reasonable. |
| Safety/compliance | 5 | No prohibited personal-data collection detected. |

## Weaknesses Found

- The assistant did not produce a valid offer after the customer supplied all required scenario information.

## Suggested Fixes

- Improve qualification extraction for natural customer wording and ensure the bot stops asking extra non-required questions once required fields are present.
