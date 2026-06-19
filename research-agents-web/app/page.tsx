"use client";

import { useMemo, useState } from "react";
import { SCIENTIST_AGENTS } from "../lib/scientistAgents";
import { ResearchMessage, ResearchResult } from "../lib/types";

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="listBlock">
      <h3>{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const [title, setTitle] = useState("Bio-inspired battery cooling experiment");
  const [hypothesis, setHypothesis] = useState(
    "A branching bio-inspired microchannel cold plate can reduce peak battery cell temperature compared with a straight-channel cold plate at the same flow rate."
  );
  const [goal, setGoal] = useState(
    "Create an engineer-ready experiment plan that can be built in a small university or startup lab."
  );
  const [constraints, setConstraints] = useState("Low budget, 4 weeks, avoid unsafe battery testing by using heater pads as battery simulators.");
  const [selected, setSelected] = useState<string[]>(SCIENTIST_AGENTS.map((a) => a.id));
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const groupedMessages = useMemo(() => {
    const groups: Record<string, ResearchMessage[]> = {};
    if (!result) return groups;
    for (const message of result.messages) {
      groups[message.round] ||= [];
      groups[message.round].push(message);
    }
    return groups;
  }, [result]);

  function toggleAgent(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function startResearch() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, hypothesis, goal, constraints, agentIds: selected })
      });

      const text = await res.text();
      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Server returned a non-JSON response.");
      }

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Research planning failed.");
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function exportMarkdown() {
    if (!result) return;
    const md = `# ${result.refinedProblem.title}\n\n## Refined Hypothesis\n${result.refinedProblem.hypothesis}\n\n## Testable Prediction\n${result.refinedProblem.testablePrediction}\n\n## Experiment Plan\n${JSON.stringify(result.experimentPlan, null, 2)}\n\n## Engineer Plan\n${JSON.stringify(result.engineerPlan, null, 2)}\n`;
    navigator.clipboard.writeText(md);
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Multi-agent scientific research planner</p>
          <h1>Research Agents</h1>
          <p className="subtitle">
            Scientists brainstorm and critique a hypothesis, then a research engineer turns it into a concrete experiment and build plan.
          </p>
        </div>
        <div className="statusCard">
          <span>Selected agents</span>
          <strong>{selected.length}</strong>
        </div>
      </section>

      <section className="panel controls">
        <label>
          Research title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          Hypothesis
          <textarea value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} />
        </label>

        <label>
          Goal
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} />
        </label>

        <label>
          Constraints
          <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} />
        </label>

        <div>
          <h2>Scientist agents</h2>
          <div className="agentGrid">
            {SCIENTIST_AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                className={`agentCard ${selected.includes(agent.id) ? "selected" : ""}`}
                type="button"
              >
                <span className="dot" style={{ background: agent.color }} />
                <strong>{agent.name}</strong>
                <small>{agent.field}</small>
              </button>
            ))}
          </div>
        </div>

        <button
  type="button"
  className="startButton"
  onClick={startResearch}
  disabled={loading || selected.length < 2 || !title.trim() || !hypothesis.trim()}
>
  {loading ? "Planning research..." : "Generate experiment plan"}
</button>
        {error && <p className="error">{error}</p>}
      </section>

      {loading && (
        <section className="panel loadingPanel">
          <div className="spinner" />
          <p>The agents are brainstorming mechanisms, criticizing assumptions, designing the experiment, and preparing an engineer-ready build plan.</p>
        </section>
      )}

      {result && (
        <>
          <section className="panel highlight">
            <div>
              <p className="eyebrow">Refined research problem</p>
              <h2>{result.refinedProblem.title}</h2>
              <p>{result.refinedProblem.hypothesis}</p>
              <p><strong>Prediction:</strong> {result.refinedProblem.testablePrediction}</p>
            </div>
            <ListBlock title="Key unknowns" items={result.refinedProblem.keyUnknowns} />
            <button className="secondaryButton" onClick={exportMarkdown}>Copy Markdown report</button>
          </section>

          <section className="panel">
            <h2>Experiment plan</h2>
            <div className="summaryGrid">
              <div><strong>Independent variable</strong><p>{result.experimentPlan.independentVariable}</p></div>
              <div><strong>Control</strong><p>{result.experimentPlan.controlCondition}</p></div>
              <div><strong>Refined hypothesis</strong><p>{result.experimentPlan.refinedHypothesis}</p></div>
            </div>
            <div className="columns">
              <ListBlock title="Dependent variables" items={result.experimentPlan.dependentVariables} />
              <ListBlock title="Materials" items={result.experimentPlan.materials} />
              <ListBlock title="Equipment" items={result.experimentPlan.equipment} />
              <ListBlock title="Measurements" items={result.experimentPlan.measurements} />
              <ListBlock title="Success criteria" items={result.experimentPlan.successCriteria} />
              <ListBlock title="Risks" items={result.experimentPlan.risks} />
            </div>
            <ListBlock title="Procedure" items={result.experimentPlan.procedure} />
            <ListBlock title="Timeline" items={result.experimentPlan.timeline} />
          </section>

          <section className="panel">
            <h2>Engineer build plan</h2>
            <p className="prototype">{result.engineerPlan.prototypeArchitecture}</p>
            <div className="columns">
              <ListBlock title="Bill of materials" items={result.engineerPlan.billOfMaterials} />
              <ListBlock title="Fabrication steps" items={result.engineerPlan.fabricationSteps} />
              <ListBlock title="Test rig" items={result.engineerPlan.testRig} />
              <ListBlock title="Sensor placement" items={result.engineerPlan.sensorPlacement} />
              <ListBlock title="Data collection" items={result.engineerPlan.dataCollection} />
              <ListBlock title="Calibration" items={result.engineerPlan.calibrationSteps} />
              <ListBlock title="Failure modes" items={result.engineerPlan.failureModes} />
              <ListBlock title="Next iteration" items={result.engineerPlan.nextIteration} />
            </div>
            <ListBlock title="Engineer timeline" items={result.engineerPlan.timeline} />
          </section>

          <section className="panel">
            <h2>Agent transcript</h2>
            {Object.entries(groupedMessages).map(([round, messages]) => (
              <div className="round" key={round}>
                <h3>{round}</h3>
                <div className="messageGrid">
                  {messages.map((message) => {
                    const agent = SCIENTIST_AGENTS.find((a) => a.id === message.agentId);
                    return (
                      <article className="message" key={message.id}>
                        <div className="messageHeader">
                          <span className="dot" style={{ background: agent?.color || "#999" }} />
                          <strong>{message.agentName}</strong>
                        </div>
                        <p>{message.content}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
