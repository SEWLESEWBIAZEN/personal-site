export const PROJECT_STAGES = ["CONCEPT", "PROTOTYPE", "IN_DEVELOPMENT", "PILOT", "PRODUCTION", "MAINTAINED", "ARCHIVED"] as const;
export type ProjectStageValue = (typeof PROJECT_STAGES)[number];

// Plain wording: a visitor should know exactly how mature a project is.
export const STAGE_LABELS: Record<ProjectStageValue, { label: string; hint: string }> = {
  CONCEPT: { label: "Concept", hint: "Explored on paper; not built yet" },
  PROTOTYPE: { label: "Prototype", hint: "Working proof of concept, not used in production" },
  IN_DEVELOPMENT: { label: "In development", hint: "Actively being built" },
  PILOT: { label: "Pilot", hint: "Used by a limited group to validate it" },
  PRODUCTION: { label: "In production", hint: "Used for real work" },
  MAINTAINED: { label: "Maintained", hint: "In production and receiving updates" },
  ARCHIVED: { label: "Archived", hint: "No longer active" },
};

export function stageLabel(stage: string | null | undefined) {
  return stage && stage in STAGE_LABELS ? STAGE_LABELS[stage as ProjectStageValue].label : null;
}

/** Case-study sections in reading order (field, public heading, admin hint). */
export const CASE_STUDY_SECTIONS = [
  ["description", "Overview", "What the project is and who it is for."],
  ["problemStatement", "The problem or opportunity", "The business problem worth solving and why it mattered."],
  ["objectives", "Objectives and requirements", "What success had to look like; constraints and requirements."],
  ["role", "My role", "What you personally owned and did. Be specific and honest."],
  ["solution", "Approach", "How the product addresses the problem."],
  ["architecture", "Architecture", "Components, boundaries, data flow. Blank lines separate paragraphs."],
  ["technicalChallenges", "Engineering decisions and challenges", "Important decisions, trade-offs and the hard parts."],
  ["keyFeatures", "Key features", "What it does well."],
  ["outcomes", "Outcomes and lessons learned", "Verifiable results and what you would do differently. No invented metrics."],
] as const;
