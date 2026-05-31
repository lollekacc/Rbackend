# Real Human Gauntlet Evaluation

## Executive Summary

- API: http://localhost:3000/api/chat
- Conversations: 200
- Total turns: 1390
- Average technical score: 4.6/5
- Average human score: 4.9/5
- Average trust score: 4.6/5
- Average sales quality score: 4.8/5
- Final average score: 4.7/5

This is a heuristic live evaluation against the real HTTP endpoint. It intentionally uses messy, difficult ordinary-customer behavior and does not modify the chatbot.

## Conversation Length Mix

1. 2 turns: 70
2. 5 turns: 60
3. 10 turns: 45
4. 20 turns: 25

## Top 20 Weaknesses

1. ignored_uncertainty: 94
2. repetitive: 54
3. under_questioning: 20
4. ignored_context: 14
5. unnecessary_qualification: 13
6. weak_trust_building: 10
7. failed_browsing_handling: 7
8. recommendation_too_late: 7
9. failed_contradiction_handling: 6
10. over_questioning: 6
11. failed_emotional_handling: 4

## Top 20 Strengths

1. handled_uncertainty: 168
2. coverage_practicality: 121
3. handled_emotion: 114
4. binding_context: 99
5. kept_conversation_state: 70
6. built_trust: 25
7. safe_direct_guess: 21
8. reward_fit_over_bonus: 16

## Most Common Failure Patterns

1. ignored_uncertainty: 94
2. repetitive: 54
3. under_questioning: 20
4. ignored_context: 14
5. unnecessary_qualification: 13
6. weak_trust_building: 10
7. failed_browsing_handling: 7
8. recommendation_too_late: 7
9. failed_contradiction_handling: 6
10. over_questioning: 6

## Most Common Success Patterns

1. handled_uncertainty: 168
2. coverage_practicality: 121
3. handled_emotion: 114
4. binding_context: 99
5. kept_conversation_state: 70
6. built_trust: 25
7. safe_direct_guess: 21
8. reward_fit_over_bonus: 16

## Lowest Persona Averages

1. skeptical: 4.4/5 (10)
2. curious_browser: 4.4/5 (10)
3. emotional: 4.6/5 (10)
4. troll_lite: 4.6/5 (10)
5. coverage_obsessed: 4.7/5 (10)
6. elderly_relative_shopper: 4.7/5 (10)
7. business_owner: 4.7/5 (10)
8. existing_customer_great_deal: 4.7/5 (10)
9. overconfident_customer: 4.7/5 (10)
10. just_wants_recommendation: 4.7/5 (10)

## Lowest Situation Averages

1. mobile_and_broadband: 4.4/5 (20)
2. mobile: 4.5/5 (20)
3. broadband: 4.6/5 (20)
4. no_binding: 4.7/5 (20)
5. family_plan: 4.7/5 (20)
6. best_value: 4.8/5 (20)
7. best_gift_card: 4.8/5 (20)
8. recommendation_without_information: 4.9/5 (20)
9. best_coverage: 4.9/5 (20)
10. refuses_questions: 5/5 (20)

## Examples Of Excellent Conversations

1. 145 distracted / broadband / 10 turns (4.6/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-145-distracted-broadband.md
2. 151 family_manager / broadband / 10 turns (4.6/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-151-family-manager-broadband.md
3. 103 skeptical / no_binding / 5 turns (4.8/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-103-skeptical-no-binding.md
4. 104 emotional / no_binding / 5 turns (4.5/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-104-emotional-no-binding.md
5. 138 troll_lite / family_plan / 10 turns (4.8/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-138-troll-lite-family-plan.md
6. 142 lazy / broadband / 10 turns (4.6/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-142-lazy-broadband.md
7. 162 lazy / mobile / 10 turns (4.8/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-162-lazy-mobile.md
8. 165 distracted / mobile / 10 turns (4.6/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-165-distracted-mobile.md
9. 075 existing_customer_great_deal / best_value / 5 turns (4.8/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-075-existing-customer-great-deal-best-value.md
10. 089 coverage_obsessed / best_gift_card / 5 turns (4.8/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-089-coverage-obsessed-best-gift-card.md

## Examples Of Poor Conversations

1. 183 skeptical / mobile_and_broadband / 20 turns (3.4/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-183-skeptical-mobile-and-broadband.md
2. 163 skeptical / mobile / 10 turns (3.5/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-163-skeptical-mobile.md
3. 143 skeptical / broadband / 10 turns (3.8/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-143-skeptical-broadband.md
4. 137 curious_browser / family_plan / 10 turns (4/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-137-curious-browser-family-plan.md
5. 198 troll_lite / mobile_and_broadband / 20 turns (4/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-198-troll-lite-mobile-and-broadband.md
6. 109 coverage_obsessed / no_binding / 5 turns (4.1/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-109-coverage-obsessed-no-binding.md
7. 117 curious_browser / no_binding / 5 turns (4.2/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-117-curious-browser-no-binding.md
8. 144 emotional / broadband / 10 turns (4.2/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-144-emotional-broadband.md
9. 157 curious_browser / broadband / 10 turns (4.2/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-157-curious-browser-broadband.md
10. 164 emotional / mobile / 10 turns (4.2/5): /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/real-human-gauntlet/2026-05-31T19-18-38-963Z-gauntlet-164-emotional-mobile.md

## Improvement Roadmap Ranked By Impact

1. Handle uncertainty and approximate memory more consistently (observed impact count: 94)
2. Keep asking enough but not too much (observed impact count: 26)
3. Avoid unnecessary qualification for browsers/reward hunters/skeptics (observed impact count: 13)
4. Improve contradiction recovery (observed impact count: 6)
5. Improve emotional acknowledgement for frustrated users (observed impact count: 4)
6. Reduce generic fallback answers (observed impact count: 0)
7. Improve context preservation in long messy conversations (observed impact count: 0)
8. Strengthen explanation of recommendation logic (observed impact count: 0)
