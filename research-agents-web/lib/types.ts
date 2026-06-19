export type ScientistAgent = {
  id: string;
  name: string;
  field: string;
  expertise: string[];
  role: string;
  style: string;
  constraints: string[];
  color: string;
};

export type ResearchInput = {
  title: string;
  hypothesis: string;
  goal: string;
  constraints: string;
  agentIds: string[];
};

export type ResearchMessage = {
  id: string;
  round: string;
  agentId: string;
  agentName: string;
  content: string;
};

export type ExperimentPlan = {
  refinedHypothesis: string;
  independentVariable: string;
  dependentVariables: string[];
  controlCondition: string;
  materials: string[];
  equipment: string[];
  procedure: string[];
  measurements: string[];
  successCriteria: string[];
  risks: string[];
  timeline: string[];
};

export type EngineerPlan = {
  prototypeArchitecture: string;
  billOfMaterials: string[];
  fabricationSteps: string[];
  testRig: string[];
  sensorPlacement: string[];
  dataCollection: string[];
  calibrationSteps: string[];
  failureModes: string[];
  timeline: string[];
  nextIteration: string[];
};

export type ResearchResult = {
  messages: ResearchMessage[];
  refinedProblem: {
    title: string;
    hypothesis: string;
    testablePrediction: string;
    keyUnknowns: string[];
  };
  experimentPlan: ExperimentPlan;
  engineerPlan: EngineerPlan;
};
