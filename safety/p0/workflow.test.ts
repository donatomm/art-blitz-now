import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import YAML from "yaml";

interface WorkflowStep {
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  env?: Record<string, string>;
}

interface WorkflowJob {
  name?: string;
  if?: string;
  steps?: WorkflowStep[];
  needs?: string;
  services?: Record<string, { image?: string; env?: Record<string, string> }>;
}

interface WorkflowTrigger {
  branches?: string[];
}

interface Workflow {
  on?: {
    pull_request?: WorkflowTrigger;
    push?: WorkflowTrigger;
    workflow_dispatch?: Record<string, unknown> | null;
  };
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

test("routes repair admission to main proposals and live safety to production proposals, updates, and manual runs", () => {
  assert.deepEqual(workflow.on?.pull_request?.branches, ["main", "production"]);
  assert.deepEqual(workflow.on?.push?.branches, ["production"]);
  assert.equal(
    workflow.jobs?.repair_admission?.if,
    "github.event_name == 'pull_request' && github.base_ref == 'main'",
  );
  assert.equal(
    workflow.jobs?.live_store_safety?.if,
    "github.event_name == 'workflow_dispatch' || github.event_name == 'push' || (github.event_name == 'pull_request' && github.base_ref == 'production')",
  );
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
  // This exact path is SQL input to the disposable Postgres test, not a CLI.
  const executableCommands = commands.replaceAll(
    "-f supabase/migrations/20260925093000_confirmed_orders.sql",
    "-f LOCAL_RECEIPT_MIGRATION",
  );
  assert.doesNotMatch(
    executableCommands,
    /git\s+push|vercel|deploy|curl|repository_dispatch|workflow_run|checkly|whatsapp|resend|stripe|supabase/i,
  );
});

test("payment database tests stay local and block both release gates on failure", () => {
  const job = workflow.jobs?.payment_infrastructure;
  assert.equal(job?.services?.postgres?.image, "postgres:16");
  const databaseSteps = job?.steps?.filter(step => step.run?.includes("psql")) ?? [];
  assert.equal(databaseSteps.length, 1);
  assert.deepEqual(databaseSteps[0].env, {
    PGHOST: "localhost", PGPORT: "5432", PGUSER: "postgres",
    PGPASSWORD: "local-ci-fixture", PGDATABASE: "postgres",
  });
  assert.equal(job?.services?.postgres?.env?.POSTGRES_PASSWORD, "local-ci-fixture");
  assert.equal(job?.steps?.find(step => step.uses === "actions/setup-node@v4")?.with?.["node-version"], "20");
  assert.equal(workflow.jobs?.repair_admission?.needs, "payment_infrastructure");
  assert.equal(workflow.jobs?.live_store_safety?.needs, "payment_infrastructure");
});

test("uploads private evidence from hidden evidence directories", () => {
  const uploads = Object.values(workflow.jobs ?? {})
    .flatMap((job) => job.steps ?? [])
    .filter((step) => step.uses === "actions/upload-artifact@v4");

  assert.equal(uploads.length, 2);
  for (const upload of uploads) {
    assert.equal(upload.with?.["include-hidden-files"], true);
  }
});
