import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import YAML from "yaml";

interface WorkflowStep {
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
}

interface WorkflowJob {
  name?: string;
  if?: string;
  steps?: WorkflowStep[];
}

interface Workflow {
  on?: Record<string, unknown>;
  permissions?: Record<string, unknown>;
  jobs?: Record<string, WorkflowJob>;
}

const workflow = YAML.parse(
  readFileSync(".github/workflows/p0-safety.yml", "utf8"),
) as Workflow;

test("defines separate repair-admission and absolute live-store results", () => {
  assert.deepEqual(Object.keys(workflow.on ?? {}).sort(), [
    "pull_request",
    "push",
    "workflow_dispatch",
  ]);
  assert.deepEqual(workflow.permissions, { contents: "read" });
  assert.equal(workflow.jobs?.repair_admission?.name, "P0 Repair Admission");
  assert.equal(workflow.jobs?.live_store_safety?.name, "P0 Live Store Safety");
  assert.equal(workflow.jobs?.repair_admission?.if, "github.event_name == 'pull_request'");

  const repairCommands = (workflow.jobs?.repair_admission?.steps ?? [])
    .flatMap((step) => step.run ? [step.run] : [])
    .join("\n");
  assert.match(repairCommands, /npm run p0:check:repair/);

  const liveCommands = (workflow.jobs?.live_store_safety?.steps ?? [])
    .flatMap((step) => step.run ? [step.run] : [])
    .join("\n");
  assert.match(liveCommands, /npm run p0:check:source/);
  assert.match(liveCommands, /npm run p0:check:artifact/);
});

test("keeps every checkout and command unable to publish or alert", () => {
  const jobs = Object.values(workflow.jobs ?? {});
  const steps = jobs.flatMap((job) => job.steps ?? []);
  const checkouts = steps.filter((step) => step.uses === "actions/checkout@v4");
  assert.ok(checkouts.length >= 3);
  for (const checkout of checkouts) {
    assert.equal(checkout.with?.["persist-credentials"], false);
  }

  const commands = steps.flatMap((step) => step.run ? [step.run] : []).join("\n");
  assert.doesNotMatch(
    commands,
    /git\s+push|vercel|deploy|curl|repository_dispatch|workflow_run|checkly|whatsapp|resend|stripe|supabase/i,
  );
});
