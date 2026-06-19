import OpenAI from "openai";

const apiKey = process.env.XAI_API_KEY;
const model = process.env.XAI_MODEL || "grok-4.3";

const client = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1"
    })
  : null;

export async function callLLM(prompt: string): Promise<string> {
  if (!client) {
    return mockLLM(prompt);
  }

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a rigorous research assistant. Follow the user's requested output format exactly. Return plain text unless JSON is requested."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1200
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) throw new Error("xAI returned an empty response.");
    return text;
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ||
      error?.error?.message ||
      error?.message ||
      "Unknown xAI API error.";
    throw new Error(`xAI API error: ${message}`);
  }
}

function mockLLM(prompt: string): string {
  if (prompt.includes("Return ONLY valid JSON") && prompt.includes("testablePrediction")) {
    return JSON.stringify({
      title: "Refined research problem",
      hypothesis: "A clearly defined intervention will produce a measurable improvement compared with a baseline control.",
      testablePrediction: "The experimental condition will outperform the control condition on the primary metric by a pre-defined threshold.",
      keyUnknowns: [
        "Whether the proposed mechanism is actually responsible for the effect",
        "Whether the result is robust across repeated trials",
        "Whether the approach remains practical under real constraints"
      ]
    });
  }

  if (prompt.includes("Return ONLY valid JSON") && prompt.includes("independentVariable")) {
    return JSON.stringify({
      refinedHypothesis: "The proposed intervention improves the primary outcome compared with a baseline control under matched conditions.",
      independentVariable: "Experimental condition versus baseline control",
      dependentVariables: ["Primary performance metric", "Secondary efficiency metric", "Failure rate"],
      controlCondition: "Baseline system with all variables matched except the intervention",
      materials: ["Prototype materials", "Mounting hardware", "Standardized test samples", "Documentation sheet"],
      equipment: ["Measurement sensors", "Data logger", "Power supply if required", "Computer for analysis", "Safety equipment"],
      procedure: [
        "Define the baseline and experimental conditions.",
        "Build or prepare identical test samples except for the independent variable.",
        "Calibrate all sensors before testing.",
        "Run baseline trials under controlled conditions.",
        "Run experimental trials under the same conditions.",
        "Record raw data, anomalies, and environmental conditions.",
        "Compare results against the success criteria."
      ],
      measurements: ["Primary outcome", "Environmental conditions", "Input settings", "Repeatability across trials"],
      successCriteria: ["Experimental condition improves the primary metric by at least 10%", "Result repeats across at least 3 trials", "No unacceptable safety or reliability failures"],
      risks: ["Measurement bias", "Confounding variables", "Prototype failure", "Unsafe operating conditions if not reviewed"],
      timeline: ["Week 1: finalize design", "Week 2: build prototype", "Week 3: run tests", "Week 4: analyze and iterate"]
    });
  }

  if (prompt.includes("Return ONLY valid JSON") && prompt.includes("prototypeArchitecture")) {
    return JSON.stringify({
      prototypeArchitecture: "A bench-scale prototype with a matched baseline and experimental condition, instrumented for repeatable measurement.",
      billOfMaterials: ["Prototype parts", "Sensors", "Data logger", "Mounting frame", "Cables", "Safety equipment"],
      fabricationSteps: ["Create CAD or layout", "Build baseline prototype", "Build experimental prototype", "Inspect dimensions", "Document all deviations"],
      testRig: ["Rigid mounting base", "Repeatable sample holder", "Sensor connections", "Computer logging station"],
      sensorPlacement: ["Place sensors at identical positions on both conditions", "Add one environmental reference sensor", "Label all channels"],
      dataCollection: ["Log timestamped data", "Record trial metadata", "Store raw CSV files", "Plot baseline versus experimental results"],
      calibrationSteps: ["Check sensor zero", "Run known reference condition", "Verify repeatability before full testing"],
      failureModes: ["Sensor drift", "Loose mounting", "Thermal or mechanical contact variation", "Operator inconsistency"],
      timeline: ["Day 1-3: design", "Day 4-10: build", "Day 11-15: calibrate", "Day 16-25: test", "Day 26-30: analyze"],
      nextIteration: ["Improve the weakest component", "Add more trials", "Test under broader conditions", "Prepare a report and decision gate"]
    });
  }

  return "Mock agent response: This agent identifies mechanisms, variables, measurements, risks, and practical implementation constraints. Add XAI_API_KEY in Vercel to enable real Grok-generated research plans.";
}
