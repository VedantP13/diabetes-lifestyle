import React, { useEffect, useState } from "react";
import axios from "axios";

// const API_BASE = "http://localhost:4000/api";
const API_BASE = "https://diabetes-lifestyle.onrender.com/api";


function App() {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/questionnaire`).then((res) => {
      setQuestionnaire(res.data);
    });
  }, []);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const goNextSection = () => {
    if (!questionnaire) return;
    if (currentSectionIndex < questionnaire.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const goPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/analyze`, answers);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing answers");
    } finally {
      setLoading(false);
    }
  };

  if (!questionnaire) {
    return <div style={{ padding: 20 }}>Loading questionnaire…</div>;
  }

  if (result) {
    return (
      <div className="app">
        <div className="result-hero">
          <h1>Personalized Lifestyle Plan</h1>
          <p className="hero-sub">
            Based on your habits, biology, and daily routine
          </p>
        </div>

        {/* Phenotype */}
        <div className="card">
          <h2>Phenotype</h2>
          <span className="phenotype-badge">
            {result.phenotype}
          </span>
        </div>

        {/* Pillar Priority */}
        <div className="card">
          <h3>Pillar Priority</h3>
          <p className="progress-label">
            (1 = most important focus for you right now)
          </p>
          <ol className="pillar-list">
            {result.pillarPriority.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </div>

        {/* Scores */}
        <div className="card">
          <h3>Scores</h3>
          <div className="score-list">
            {Object.entries(result.scores).map(([key, value]) => (
              <div key={key} className="score-item">
                <div className="score-label">
                  <span>{key}</span>
                  <span>{value}</span>
                </div>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Insights */}
        <div className="card">
          <h3>Why this pattern?</h3>
          <ul>
            {result.insights.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>

        {/* Forecast */}
        <div className="card">
          <h3>What may improve if you follow this?</h3>
          <ul>
            {result.forecast.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>

        {/* Universal Advice */}
        <div className="card">
          <h3>Universal Lifestyle Advice</h3>
          <ul>
            {result.universalAdvice.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>

        {/* Personalized Suggestions */}
        <h3>Personalized Suggestions</h3>
        <div className="card-grid">
          <PillarCard title="Sleep" items={result.pillarSuggestions.sleep} />
          <PillarCard title="Food" items={result.pillarSuggestions.food} />
          <PillarCard title="Physical Activity" items={result.pillarSuggestions.activity} />
          <PillarCard title="Happiness & Stress" items={result.pillarSuggestions.happiness} />
        </div>

        {/* Practices */}
        {result.uiHints?.showMudraCard && (
          <div className="practice">
            <MudraCard />
          </div>
        )}

        {result.uiHints?.showHeelRaiseCard && (
          <div className="practice">
            <HeelRaiseCard />
          </div>
        )}

        {result.uiHints?.showLaughterCard && (
          <div className="practice">
            <LaughterCard />
          </div>
        )}

        {/* Reset */}
        <div className="button-row">
          <button
            type="button"
            className="secondary"
            onClick={() => setResult(null)}
          >
            ⟲ Start Again
          </button>
        </div>
      </div>
    );
  }


  const section = questionnaire.sections[currentSectionIndex];

  return (
    <div className="app">
      <h1>Diabetes Lifestyle Assessment</h1>
      <ProgressBar
        current={currentSectionIndex + 1}
        total={questionnaire.sections.length}
      />
      <h2>
        {currentSectionIndex + 1}. {section.title}
      </h2>

      {section.questions.map((q) => (
        <Question
          key={q.id}
          question={q}
          value={answers[q.id]}
          onChange={handleAnswerChange}
        />
      ))}

      <div className="button-row">
        {currentSectionIndex > 0 && (
          <button
            className="secondary"
            type="button"
            onClick={goPrevSection}
          >
            ← Back
          </button>
        )}

        {currentSectionIndex < questionnaire.sections.length - 1 && (
          <button
            type="button"
            onClick={goNextSection}
          >
            Next →
          </button>
        )}

        {currentSectionIndex === questionnaire.sections.length - 1 && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Analyzing…" : "Get My Plan"}
          </button>
        )}
      </div>

    </div>
  );
}

function Question({ question, value, onChange }) {
  const handleChange = (e) => onChange(question.id, e.target.value);

  return (
    <div className="question-block">
      <label className="question-label">{question.label}</label>

      {question.type === "number" && (
        <input
          type="number"
          value={value || ""}
          onChange={handleChange}
        />
      )}

      {question.type === "single_choice" && (
        <div>
          {question.options.map((opt) => (
            <label key={opt} className="option">
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={value === opt}
                onChange={handleChange}
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {question.type === "multi_choice" && (
        <div>
          {question.options.map((opt) => (
            <label key={opt} className="option">
              <input
                type="checkbox"
                value={opt}
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  let newVal = Array.isArray(value) ? [...value] : [];
                  if (checked) {
                    if (!newVal.includes(opt)) newVal.push(opt);
                  } else {
                    newVal = newVal.filter((v) => v !== opt);
                  }
                  onChange(question.id, newVal);
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}


function PillarCard({ title, items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="pillar-card">
      <h4 className="pillar-title">{title}</h4>
      <ul className="pillar-list">
        {items.map((it, idx) => (
          <li key={idx}>{it}</li>
        ))}
      </ul>
    </div>
  );
}


function MudraCard() {
  return (
    <div
      style={{
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
        border: "1px dashed #888"
      }}
    >
      <h3>Mudra Practice (Pre-meal)</h3>
      <p>
        Example: Gyan Mudra – touch the tip of the thumb and index finger,
        keep other fingers relaxed on your knees, sit comfortably and breathe
        slowly for 10–15 minutes before meals.
      </p>
      <p>(Developer: insert vector illustration of Gyan Mudra here.)</p>
    </div>
  );
}

function HeelRaiseCard() {
  return (
    <div
      style={{
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
        border: "1px dashed #888"
      }}
    >
      <h3>Seated Heel-Raise Exercise</h3>
      <p>
        Sit on a chair with feet flat. Keep toes on the ground and repeatedly
        lift your heels up and down for 5–10 minutes, especially after meals
        or long sitting. This activates calf muscles and helps blood sugar use.
      </p>
      <p>(Developer: insert vector illustration sequence of heel raises here.)</p>
    </div>
  );
}

function LaughterCard() {
  return (
    <div
      style={{
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
        border: "1px dashed #888"
      }}
    >
      <h3>Laughter & Joy</h3>
      <p>
        Plan small doses of laughter into your week: comedy shows, cartoons,
        joking with friends or family. Aim to laugh out loud at least a few
        times a day. This relaxes stress hormones that push sugar up.
      </p>
    </div>
  );
}

// function ProgressBar({ current, total }) {
//   const percent = (current / total) * 100;
//   return (
//     <div className="question-block">
//       <div
//         style={{
//           height: 8,
//           background: "#eee",
//           borderRadius: 4,
//           overflow: "hidden"
//         }}
//       >
//         <div
//           style={{
//             width: `${percent}%`,
//             height: "100%",
//             transition: "width 0.3s",
//             background: "#4caf50"
//           }}
//         />
//       </div>
//       <div style={{ fontSize: 12, marginTop: 4 }}>
//         Step {current} of {total}
//       </div>
//     </div>
//   );
// }
function ProgressBar({ current, total }) {
  const percent = (current / total) * 100;
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-label">
        Step {current} of {total}
      </div>
    </div>
  );
}



export default App;
