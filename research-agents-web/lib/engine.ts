import { getAgentsById } from "./scientistAgents";
import { ExperimentPlan, ResearchInput, ResearchMessage, ResearchResult, EngineerPlan } from "./types";
import { callLLM } from "./llm";
import { engineerPlanPrompt, experimentPlanPrompt, refinedProblemPrompt, scientistPrompt } from "./prompts";

function transcriptText(messages: ResearchMessage[]) {
  return messages.map((m) => `[${m.round}] ${m.agentName}: ${m.content}`).join("\n\n");
}

function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

function fallbackRefinedProblem(input: ResearchInput) {
  return {
    title: input.title || "Research hypothesis",
    hypothesis: input.hypothesis || "The proposed intervention changes a measurable outcome compared with a baseline.",
    testablePrediction: "The experimental condition will outperform the baseline on a pre-defined primary metric.",
    keyUnknowns: [
      "Whether the mechanism is valid",
      "Whether the effect is measurable",
      "Whether the result is feasible under the stated constraints"
    ]
  };
}

function fallbackExperimentPlan(input: ResearchInput): ExperimentPlan {
  return {
    refinedHypothesis: input.hypothesis || "The proposed intervention improves a measurable outcome compared with a baseline.",
    independentVariable: "Experimental intervention versus baseline control",
    dependentVariables: ["Primary outcome metric", "Secondary performance metric", "Failure or error rate"],
    controlCondition: "Baseline condition with all variables matched except the intervention",
    materials: ["Prototype materials", "Matched control materials", "Mounting hardware", "Documentation template"],
    equipment: ["Sensors", "Data logger", "Computer", "Calibration reference", "Safety equipment"],
    procedure: [
      "Define the baseline and experimental conditions.",
      "Build matched prototypes that differ only in the independent variable.",
      "Calibrate all measurement equipment.",
      "Run baseline trials under fixed conditions.",
      "Run experimental trials under the same conditions.",
      "Repeat each condition at least three times.",
      "Analyze whether the success criteria were met."
    ],
    measurements: ["Primary metric", "Input conditions", "Environmental conditions", "Trial notes"],
    successCriteria: ["At least 10% improvement in the primary metric", "Repeatable across trials", "No unacceptable safety or reliability problems"],
    risks: ["Confounding variables", "Measurement noise", "Prototype inconsistency", "Safety hazards requiring review"],
    timeline: ["Week 1: design", "Week 2: build", "Week 3: test", "Week 4: analyze and iterate"]
  };
}

function fallbackEngineerPlan(): EngineerPlan {
  return {
    prototypeArchitecture: "Bench-scale matched baseline and experimental prototypes with repeatable instrumentation.",
    billOfMaterials: ["Prototype parts", "Sensors", "Data logger", "Mounting hardware", "Cables", "Safety equipment"],
    fabricationSteps: ["Finalize design", "Build baseline", "Build experimental prototype", "Inspect and document", "Prepare test rig"],
    testRig: ["Stable mounting frame", "Repeatable sample holder", "Sensor wiring", "Data logging computer"],
    sensorPlacement: ["Use identical sensor positions", "Add environmental reference sensor", "Label channels clearly"],
    dataCollection: ["Record timestamped raw data", "Save metadata", "Plot baseline versus experiment", "Archive all files"],
    calibrationSteps: ["Check sensor zero", "Run reference condition", "Verify repeatability"],
    failureModes: ["Sensor drift", "Loose mounting", "Operator inconsistency", "Prototype damage"],
    timeline: ["Days 1-3: design", "Days 4-10: build", "Days 11-15: calibrate", "Days 16-25: test", "Days 26-30: analyze"],
    nextIteration: ["Fix largest failure mode", "Add more trials", "Test broader conditions", "Prepare report"]
  };
}

export async function runResearch(input: ResearchInput): Promise<ResearchResult> {
  const agents = getAgentsById(input.agentIds);
  if (agents.length < 2) {
    throw new Error("Select at least two scientist agents.");
  }

  const messages: ResearchMessage[] = [];
  const rounds = [
    "Brainstorm mechanisms and variables",
    "Critique assumptions and confounders",
    "Feasibility and measurement plan"
  ];

  for (const round of rounds) {
    for (const agent of agents) {
      const content = await callLLM(
        scientistPrompt({
          agent,
          round,
          title: input.title,
          hypothesis: input.hypothesis,
          goal: input.goal,
          constraints: input.constraints,
          transcript: transcriptText(messages)
        })
      );

      messages.push({
        id: `${round}-${agent.id}-${messages.length}`,
        round,
        agentId: agent.id,
        agentName: agent.name,
        content
      });
    }
  }

  const transcript = transcriptText(messages);

  const refinedText = await callLLM(
    refinedProblemPrompt({
      title: input.title,
      hypothesis: input.hypothesis,
      goal: input.goal,
      constraints: input.constraints,
      transcript
    })
  );
  const refinedProblem = safeJsonParse(refinedText, fallbackRefinedProblem(input));

  const experimentText = await callLLM(
    experimentPlanPrompt({
      title: input.title,
      hypothesis: input.hypothesis,
      goal: input.goal,
      constraints: input.constraints,
      transcript
    })
  );
  const experimentPlan = safeJsonParse<ExperimentPlan>(experimentText, fallbackExperimentPlan(input));

  const engineerText = await callLLM(
    engineerPlanPrompt({
      title: input.title,
      hypothesis: input.hypothesis,
      goal: input.goal,
      constraints: input.constraints,
      transcript,
      experimentPlanJson: JSON.stringify(experimentPlan, null, 2)
    })
  );
  const engineerPlan = safeJsonParse<EngineerPlan>(engineerText, fallbackEngineerPlan());

  return {
    messages,
    refinedProblem,
    experimentPlan,
    engineerPlan
  };
}
