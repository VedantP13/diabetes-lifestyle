const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load questionnaire
const questionnairePath = path.join(__dirname, "questionnaire.json");
const questionnaire = JSON.parse(fs.readFileSync(questionnairePath, "utf8"));

const get = (obj, key, def = null) =>
  Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : def;

/**
 * SCORING LOGIC
 */

function computeScores(answers) {
  let sleep = 100;
  let food = 100;
  let activity = 100;
  let happiness = 100;

  // SLEEP
  const bedtime = get(answers, "sleep_bedtime");
  if (bedtime === "After 11:30 pm") sleep -= 20;
  else if (bedtime === "10–11:30 pm") sleep -= 10;

  const sleepDuration = get(answers, "sleep_duration");
  if (sleepDuration === "Less than 5 hours") sleep -= 25;
  else if (sleepDuration === "5–6 hours") sleep -= 15;
  else if (sleepDuration === "6–7 hours") sleep -= 5;

  const rest = get(answers, "sleep_restfulness");
  if (rest === "Never") sleep -= 20;
  else if (rest === "Rarely") sleep -= 10;
  else if (rest === "Sometimes") sleep -= 5;

  const screensBefore = get(answers, "sleep_screens_before");
  if (screensBefore === "Always") sleep -= 15;
  else if (screensBefore === "Often") sleep -= 10;
  else if (screensBefore === "Sometimes") sleep -= 5;

  const nightWaking = get(answers, "sleep_night_waking");
  if (nightWaking === "Often") sleep -= 15;
  else if (nightWaking === "Sometimes") sleep -= 8;
  else if (nightWaking === "Rarely") sleep -= 3;

  const snoring = get(answers, "sleep_snoring");
  if (snoring === "Yes") sleep -= 10;

  // FOOD
  const dinnerTime = get(answers, "dinner_time");
  if (dinnerTime === "After 9:30 pm") food -= 20;
  else if (dinnerTime === "8–9:30 pm") food -= 10;

  const dinnerGap = get(answers, "dinner_sleep_gap");
  if (dinnerGap === "Less than 1 hour") food -= 20;
  else if (dinnerGap === "1–2 hours") food -= 10;

  const eatingSpeed = get(answers, "eating_speed");
  if (eatingSpeed === "Very fast") food -= 15;
  else if (eatingSpeed === "Fast") food -= 10;

  const chewing = get(answers, "chewing");
  if (chewing === "Never") food -= 15;
  else if (chewing === "Rarely") food -= 10;
  else if (chewing === "Sometimes") food -= 5;

  const screensEating = get(answers, "screens_while_eating");
  if (screensEating === "Always") food -= 10;
  else if (screensEating === "Often") food -= 5;

  const outsideFood = get(answers, "outside_food_freq");
  if (outsideFood === "More than 5") food -= 20;
  else if (outsideFood === "4–5") food -= 15;
  else if (outsideFood === "2–3") food -= 5;

  const friedOutside = get(answers, "fried_food_outside");
  if (friedOutside === "Almost always") food -= 15;
  else if (friedOutside === "Often") food -= 10;
  else if (friedOutside === "Sometimes") food -= 5;

  const milkCups = get(answers, "milk_tea_coffee_freq");
  const milkTiming = get(answers, "milk_timing_vs_breakfast");
  if (milkCups === "3–4" || milkCups === "5 or more") food -= 10;

  if (
    milkTiming === "More than 1 hour before breakfast" ||
    milkTiming === "Within 1 hour before breakfast"
  ) {
    food -= 10; // hidden extra meal effect
  }

  const teaSugar = get(answers, "tea_coffee_sugar");
  if (teaSugar === "Always") food -= 15;
  else if (teaSugar === "Often") food -= 10;
  else if (teaSugar === "Sometimes") food -= 5;

  const sweetener = get(answers, "artificial_sweetener");
  if (sweetener === "Daily") food -= 15;
  else if (sweetener === "Sometimes") food -= 5;

  const snacksWithTea = get(answers, "snacks_with_tea");
  if (snacksWithTea === "Always") food -= 10;
  else if (snacksWithTea === "Often") food -= 5;

  const fruitHigh = get(answers, "high_sugar_fruit_freq");
  if (fruitHigh === "Almost daily") food -= 15;
  else if (fruitHigh === "2–3× per week") food -= 7;

  const nightVeg = get(answers, "night_veg_gourd_group_freq");
  if (nightVeg === "0–1") food -= 10;
  else if (nightVeg === "2–3") food -= 5;

  const indigestion = get(answers, "indigestion_freq");
  if (indigestion === "Often") food -= 15;
  else if (indigestion === "Sometimes") food -= 8;

  const pureVegNoDairy = get(answers, "pure_veg_no_dairy");
  const b12Status = get(answers, "b12_status");
  if (pureVegNoDairy === "Yes") {
    if (!b12Status || b12Status === "Never tested" || b12Status === "Not sure") {
      food -= 10;
    }
  }

  // ACTIVITY
  const walk = get(answers, "walk_minutes_per_day");
  if (walk === "0–10") activity -= 25;
  else if (walk === "10–30") activity -= 10;

  const sitting = get(answers, "sitting_hours_per_day");
  if (sitting === "More than 8") activity -= 20;
  else if (sitting === "6–8") activity -= 10;

  const structured = get(answers, "structured_exercise");
  if (structured === "No") activity -= 10;
  else if (structured === "1–2× per week") activity -= 5;

  const uphillFreq = get(answers, "uphill_walk_freq");
  if (uphillFreq === "Once a week") {
    activity += 5;
  } else if (uphillFreq === "2 or more times per week") {
    activity += 10;
  }

  // HAPPINESS / STRESS
  const jobStress = get(answers, "job_stress");
  if (jobStress === "Very high") happiness -= 20;
  else if (jobStress === "High") happiness -= 15;
  else if (jobStress === "Moderate") happiness -= 5;

  const duty = get(answers, "duty_responsibility");
  if (duty === "Always") happiness -= 10;
  else if (duty === "Often") happiness -= 5;

  const perfFear = get(answers, "performance_fear");
  if (perfFear === "Always") happiness -= 15;
  else if (perfFear === "Often") happiness -= 10;

  const generalWorry = get(answers, "general_worry");
  if (generalWorry === "Always") happiness -= 10;
  else if (generalWorry === "Often") happiness -= 5;

  const checking = get(answers, "checking_behaviour");
  if (checking === "Yes daily") happiness -= 10;
  else if (checking === "Sometimes") happiness -= 5;

  const closePeople = get(answers, "close_people_to_share");
  if (closePeople === "0") happiness -= 10;
  else if (closePeople === "1") happiness -= 5;

  const laughFreq = get(answers, "laugh_loud_freq");
  if (laughFreq === "0") happiness -= 10;
  else if (laughFreq === "1–2 times") happiness -= 5;

  const comedyFreq = get(answers, "comedy_content_freq");
  if (comedyFreq === "Never") happiness -= 5;

  const gratitude = get(answers, "gratitude_feeling");
  if (gratitude === "Rarely") happiness -= 10;
  else if (gratitude === "Sometimes") happiness -= 5;

  sleep = Math.max(0, Math.min(100, sleep));
  food = Math.max(0, Math.min(100, food));
  activity = Math.max(0, Math.min(100, activity));
  happiness = Math.max(0, Math.min(100, happiness));

  return { sleep, food, activity, happiness };
}

/**
 * PHENOTYPE, INSIGHTS & FORECAST
 */

function determinePhenotype(scores, answers) {
  const pillars = [
    { key: "sleep", score: scores.sleep },
    { key: "food", score: scores.food },
    { key: "activity", score: scores.activity },
    { key: "happiness", score: scores.happiness }
  ];
  pillars.sort((a, b) => a.score - b.score);

  const worst = pillars[0].key;

  let phenotype = "Mixed Type (multiple factors)";
  if (worst === "happiness") {
    const duty = get(answers, "duty_responsibility");
    const perfFear = get(answers, "performance_fear");
    if (duty === "Always" || duty === "Often") {
      phenotype = "Duty-Driven Stress Type";
    } else if (perfFear === "Always" || perfFear === "Often") {
      phenotype = "Fear/Stress-Driven Glucose Type";
    } else {
      phenotype = "Stress & Happiness-Related Type";
    }
  } else if (worst === "food") {
    const indigestion = get(answers, "indigestion_freq");
    if (indigestion === "Often" || indigestion === "Sometimes") {
      phenotype = "Digestion & Food-Pattern Type";
    } else {
      phenotype = "Food-Pattern & Timing Type";
    }
  } else if (worst === "activity") {
    phenotype = "Low-Activity & Sitting Type";
  } else if (worst === "sleep") {
    phenotype = "Sleep-Disruption Type";
  }

  const menopause = get(answers, "female_menopause_stage");
  if (
    menopause === "Perimenopausal (irregular, approaching menopause)" ||
    menopause === "Menopausal / Postmenopausal"
  ) {
    phenotype += " (Hormonal Influence)";
  }

  return {
    phenotype,
    pillarPriority: pillars.map((p) => p.key)
  };
}

function universalAdviceBlock() {
  return [
    "Finish dinner before 8 pm where possible and keep at least 2 hours before sleep.",
    "Avoid mobile / TV / laptop for at least 30 minutes before sleeping. Let your mind wind down.",
    "Sleep in a dark, quiet room as much as possible.",
    "On waking, drink water, stretch gently, and avoid checking your phone immediately.",
    "Prefer millets and traditional rice (like local, less polished varieties) over refined white rice and maida, with proper soaking and cooking.",
    "Eat mindfully: sit properly, chew each mouthful ~15–20 times, avoid screens, and avoid talking intensely while eating.",
    "Avoid artificial sweetener pills or powders; work on reducing overall sweetness preference.",
    "Get 10–20 minutes of safe sunlight on arms/face on most days for Vitamin D support.",
    "Practice 10–15 minutes of a simple mudra with slow breathing before main meals (e.g., Gyan Mudra) to calm your mind.",
    "Give your mind chances to laugh: watch comedy, cartoons or talk to someone who makes you smile, several times a week.",
    "Please do not stop or change any prescribed medication without your doctor's advice. This app supports lifestyle; it does not replace medical care."
  ];
}

function buildPillarSuggestions(scores, answers) {
  const out = { sleep: [], food: [], activity: [], happiness: [] };

  // SLEEP
  if (scores.sleep < 90) {
    const bedtime = get(answers, "sleep_bedtime");
    if (bedtime === "After 11:30 pm" || bedtime === "10–11:30 pm") {
      out.sleep.push(
        "Move your bedtime earlier by 30–60 minutes. Aim to be in bed by around 10–10:30 pm over the next few weeks."
      );
    }
    const screens = get(answers, "sleep_screens_before");
    if (screens === "Always" || screens === "Often") {
      out.sleep.push(
        "Create a 30-minute screen-free buffer before sleep. Use this time for light reading, gentle music or simple breathing."
      );
    }
    const nightWaking = get(answers, "sleep_night_waking");
    if (nightWaking === "Often" || nightWaking === "Sometimes") {
      out.sleep.push(
        "If you wake at night, keep lights dim and avoid screens. Try slow breathing instead of checking your phone."
      );
    }
    const snoring = get(answers, "sleep_snoring");
    if (snoring === "Yes") {
      out.sleep.push(
        "Loud snoring or pauses in breathing may suggest sleep apnea. Please discuss this with your doctor for further evaluation."
      );
    }
  }

  // FOOD
  if (scores.food < 90) {
    const dinnerTime = get(answers, "dinner_time");
    if (dinnerTime === "After 9:30 pm" || dinnerTime === "8–9:30 pm") {
      out.food.push(
        "Shift your dinner earlier. Aim to finish dinner before 8 pm with 2–3 hours gap before sleep."
      );
    }

    const milkTiming = get(answers, "milk_timing_vs_breakfast");
    const milkCups = get(answers, "milk_tea_coffee_freq");
    if (
      (milkTiming === "More than 1 hour before breakfast" ||
        milkTiming === "Within 1 hour before breakfast") &&
      (milkCups === "1–2" || milkCups === "3–4" || milkCups === "5 or more")
    ) {
      out.food.push(
        "Your early morning milk/tea/coffee may behave like an extra meal. For 2 weeks, try having breakfast directly, or take unsweetened tea/coffee after breakfast instead."
      );
    }

    const teaSugar = get(answers, "tea_coffee_sugar");
    if (teaSugar === "Always" || teaSugar === "Often") {
      out.food.push(
        "Gradually reduce sugar in tea/coffee. Start by reducing 25–50% of the sugar and move toward no sugar over a few weeks."
      );
    }

    const sweetener = get(answers, "artificial_sweetener");
    if (sweetener === "Daily" || sweetener === "Sometimes") {
      out.food.push(
        "Try to reduce or avoid artificial sweetener pills/powders. They may confuse appetite and metabolism. Work toward enjoying less-sweet tastes."
      );
    }

    const outsideFood = get(answers, "outside_food_freq");
    if (outsideFood === "4–5" || outsideFood === "More than 5") {
      out.food.push(
        "Reduce outside/hotel food frequency. Aim for at least 2–3 extra home-cooked meals per week to cut hidden oils and refined carbs."
      );
    }

    const indigestion = get(answers, "indigestion_freq");
    if (indigestion === "Often" || indigestion === "Sometimes") {
      out.food.push(
        "Focus on digestion: chew thoroughly, eat slowly, and avoid drinking large amounts of water during and immediately after meals."
      );
    }

    const nightVeg = get(answers, "night_veg_gourd_group_freq");
    if (nightVeg === "0–1" || nightVeg === "2–3") {
      out.food.push(
        "At dinner, make one of these vegetables the hero of your plate most nights: snake gourd, bottle gourd, ridge gourd, bitter gourd, okra, chow-chow or knol-khol. They are low in carbs and support sugar control."
      );
    }

    const dietType = get(answers, "diet_type");
    const pureVegNoDairy = get(answers, "pure_veg_no_dairy");
    const b12Status = get(answers, "b12_status");
    if (dietType && dietType.startsWith("Vegetarian") && pureVegNoDairy === "Yes") {
      out.food.push(
        "You are a vegetarian and also avoid dairy. Vitamin B12 may slowly drop. Please ask your doctor for a B12 blood test and follow their advice on supplements if needed."
      );
    }

    const fruitHigh = get(answers, "high_sugar_fruit_freq");
    if (fruitHigh === "Almost daily" || fruitHigh === "2–3× per week") {
      out.food.push(
        "Use banana, mango, grapes and custard apple as occasional treats, not daily. Prefer guava, papaya, apple and orange as your regular fruits in moderate portions."
      );
    }
  }

  // ACTIVITY
  if (scores.activity < 90) {
    const walk = get(answers, "walk_minutes_per_day");
    if (walk === "0–10") {
      out.activity.push(
        "Start with 10–15 minutes of relaxed walking daily. You can break it into 2 × 5–7 minute walks if that feels easier."
      );
    } else if (walk === "10–30") {
      out.activity.push(
        "Gradually increase your walking time to 20–30 minutes daily at a comfortable pace."
      );
    }

    const sitting = get(answers, "sitting_hours_per_day");
    if (sitting === "More than 8" || sitting === "6–8") {
      out.activity.push(
        "Avoid long sitting marathons. Every 60–90 minutes, stand up or move for 3–5 minutes to improve blood circulation and sugar handling."
      );
    }

    const heelPossible = get(answers, "heel_raise_possible");
    if (heelPossible === "Yes" || heelPossible === "Probably") {
      out.activity.push(
        "After meals or during long sitting, do simple seated heel-raises for 5–10 minutes. Lift your heels up and down rhythmically while toes stay on the ground. This helps your calf muscles use blood sugar and support circulation."
      );
    }

    const uphillFreq = get(answers, "uphill_walk_freq");
    if (uphillFreq === "Never" || uphillFreq === "Once a month") {
      out.activity.push(
        "If your joints and heart are okay, try to include a small uphill walk or simple trek in nature once a week or once in two weeks. Many people notice better sugar the next morning."
      );
    }
  }

  // HAPPINESS / STRESS
  if (scores.happiness < 90) {
    const jobStress = get(answers, "job_stress");
    const duty = get(answers, "duty_responsibility");
    const perfFear = get(answers, "performance_fear");

    if (jobStress === "Very high" || jobStress === "High") {
      out.happiness.push(
        "Your work stress is high. Add small stress valves: 5 minutes of slow breathing, a short walk, or a brief stretch every few hours."
      );
    }

    if (duty === "Always" || duty === "Often") {
      out.happiness.push(
        "You carry heavy duty and responsibility. Remember that your health is also a duty. Protect your sleep, food quality and movement as non-negotiable."
      );
    }

    if (perfFear === "Always" || perfFear === "Often") {
      out.happiness.push(
        "Performance fear can keep your body in 'fight or flight' mode. Before meals, practice 10–15 minutes of Gyan Mudra with slow breathing to tell your body it is safe."
      );
    }

    const laughFreq = get(answers, "laugh_loud_freq");
    const comedyFreq = get(answers, "comedy_content_freq");
    if (laughFreq === "0" || comedyFreq === "Never") {
      out.happiness.push(
        "Add laughter intentionally: watch comedy, cartoons, or funny clips at least 3 times a week. Laughter lowers stress hormones and supports better sugar control."
      );
    }

    const closePeople = get(answers, "close_people_to_share");
    if (closePeople === "0" || closePeople === "1") {
      out.happiness.push(
        "Try to gently build one or two safe relationships where you can share your worries. Even one good listener reduces the load on your mind and body."
      );
    }

    const gratitude = get(answers, "gratitude_feeling");
    if (gratitude === "Rarely" || gratitude === "Sometimes") {
      out.happiness.push(
        "At night, write down 1–3 small things you feel grateful for each day (a kind word, a meal, a tree, sunlight). This simple habit supports emotional balance."
      );
    }

    out.happiness.push(
      "Before your main meals, sit comfortably and practice a mudra (e.g., Gyan Mudra: touch thumb and index finger) with slow breathing for 10–15 minutes. This helps calm stress signals that push sugar up."
    );
  }

  return out;
}

function buildInsights(scores, phenotypeInfo, answers) {
  const insights = [];
  const worstPillar = phenotypeInfo.pillarPriority[0];

  if (worstPillar === "food") {
    const dinnerTime = get(answers, "dinner_time");
    const milkTiming = get(answers, "milk_timing_vs_breakfast");
    const outsideFood = get(answers, "outside_food_freq");
    const indigestion = get(answers, "indigestion_freq");

    let reason = "Your answers suggest that food pattern is a key driver for your sugar pattern.";
    if (dinnerTime === "8–9:30 pm" || dinnerTime === "After 9:30 pm") {
      reason += " Dinner is relatively late, giving your body less time to digest before sleep.";
    }
    if (
      milkTiming === "More than 1 hour before breakfast" ||
      milkTiming === "Within 1 hour before breakfast"
    ) {
      reason += " Early milk/tea/coffee may be acting like an extra meal before breakfast.";
    }
    if (outsideFood === "4–5" || outsideFood === "More than 5") {
      reason += " Frequent outside/hotel food increases hidden oils and refined carbs.";
    }
    if (indigestion === "Sometimes" || indigestion === "Often") {
      reason += " You also report indigestion, which shows that digestion itself needs support.";
    }
    insights.push(reason);
  }

  if (worstPillar === "happiness") {
    const jobStress = get(answers, "job_stress");
    const perfFear = get(answers, "performance_fear");
    const duty = get(answers, "duty_responsibility");

    let reason = "Your answers show that mental stress and emotional load are major factors.";
    if (jobStress === "Very high" || jobStress === "High") {
      reason += " Your job/work feels highly stressful.";
    }
    if (perfFear === "Always" || perfFear === "Often") {
      reason += " There is significant fear around performance, security or money.";
    }
    if (duty === "Always" || duty === "Often") {
      reason += " You also carry strong duty/responsibility where mistakes can harm others.";
    }
    insights.push(reason);
  }

  if (worstPillar === "sleep") {
    const bedtime = get(answers, "sleep_bedtime");
    const screensBefore = get(answers, "sleep_screens_before");
    let reason = "Your sleep pattern looks like a key piece of your health puzzle.";
    if (bedtime === "After 11:30 pm" || bedtime === "10–11:30 pm") {
      reason += " You tend to sleep late, which can disturb hormonal balance and sugar rhythm.";
    }
    if (screensBefore === "Always" || screensBefore === "Often") {
      reason += " Screens close to bedtime can keep your brain active and reduce sleep quality.";
    }
    insights.push(reason);
  }

  if (worstPillar === "activity") {
    const walk = get(answers, "walk_minutes_per_day");
    const sitting = get(answers, "sitting_hours_per_day");

    let reason = "Movement and daily activity are showing up as a main area to support.";
    if (walk === "0–10") {
      reason += " Walking time is very low, so muscles are not getting enough chance to use sugar.";
    }
    if (sitting === "6–8" || sitting === "More than 8") {
      reason += " Long sitting hours keep your metabolism in 'idle' mode for too long.";
    }
    insights.push(reason);
  }

  const menopause = get(answers, "female_menopause_stage");
  if (
    menopause === "Perimenopausal (irregular, approaching menopause)" ||
    menopause === "Menopausal / Postmenopausal"
  ) {
    insights.push(
      "You are in a menopause-related stage. Hormonal shifts at this time can make sugar more sensitive to stress, sleep and food patterns."
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Your pattern seems to be influenced by a combination of sleep, food, movement and stress. Small improvements in each area can work together to support better sugar balance."
    );
  }

  return insights;
}

function buildForecast(scores, phenotypeInfo, answers) {
  const forecast = [];
  const worst = phenotypeInfo.pillarPriority[0];

  if (worst === "food") {
    forecast.push(
      "If you consistently move dinner earlier, reduce sugar in tea/coffee and limit hotel/fried foods for the next 6–8 weeks, you are likely to see smoother post-meal sugar levels and less heaviness after food."
    );
  }

  if (worst === "activity") {
    forecast.push(
      "If you start daily walks and add short movement breaks or heel-raises after long sitting for 6–8 weeks, you are likely to notice better morning energy and more stable sugars."
    );
  }

  if (worst === "sleep") {
    forecast.push(
      "If you create a regular sleep time, reduce late-night screens and keep a 2–3 hour gap between dinner and sleep for a few weeks, you are likely to experience deeper sleep and more balanced appetite and cravings."
    );
  }

  if (worst === "happiness") {
    forecast.push(
      "If you gently work on reducing overload (small breaks, breathing, laughter, sharing with trusted people) for the next 4–8 weeks, you are likely to feel calmer and may notice stress-related sugar spikes reducing."
    );
  }

  const dietType = get(answers, "diet_type");
  const pureVegNoDairy = get(answers, "pure_veg_no_dairy");
  const b12Status = get(answers, "b12_status");
  if (dietType && dietType.startsWith("Vegetarian") && pureVegNoDairy === "Yes") {
    if (!b12Status || b12Status === "Never tested" || b12Status === "Not sure") {
      forecast.push(
        "If a Vitamin B12 test shows low levels and your doctor corrects this, you may notice better energy, mood and possibly more stable sugars over the coming months."
      );
    }
  }

  if (forecast.length === 0) {
    forecast.push(
      "If you follow the suggested small changes in sleep, food, movement and stress for the next 6–8 weeks, you are likely to feel improvements in energy, digestion, sleep quality and sugar stability."
    );
  }

  return forecast;
}

function buildResponse(answers) {
  const scores = computeScores(answers);
  const phenotypeInfo = determinePhenotype(scores, answers);
  const universalAdvice = universalAdviceBlock();
  const pillarSuggestions = buildPillarSuggestions(scores, answers);
  const insights = buildInsights(scores, phenotypeInfo, answers);
  const forecast = buildForecast(scores, phenotypeInfo, answers);

  return {
    scores,
    phenotype: phenotypeInfo.phenotype,
    pillarPriority: phenotypeInfo.pillarPriority,
    universalAdvice,
    pillarSuggestions,
    insights,
    forecast,
    uiHints: {
      showMudraCard: true,
      showHeelRaiseCard: true,
      showLaughterCard: true
    }
  };
}

// ROUTES

app.get("/api/questionnaire", (req, res) => {
  res.json(questionnaire);
});

app.post("/api/analyze", (req, res) => {
  const answers = req.body || {};
  const result = buildResponse(answers);
  res.json(result);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
