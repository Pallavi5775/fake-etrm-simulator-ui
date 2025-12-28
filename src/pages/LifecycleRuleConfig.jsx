
import { useEffect, useState } from "react";
import LifecycleRuleTable from "../components/LifecycleRuleTable";
import RuleSimulationModal from "../components/RuleSimulationModal";
import LifecycleRuleForm from "../components/LifecycleRuleForm";
import {
  getRules, createRule, toggleRule
} from "../api/lifecycleRulesApi";

import axios from "axios";

export default function LifecycleRuleConfig() {
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [result, setResult] = useState(null);
  
const load = () => getRules().then(res => setRules(res.data));

  useEffect(() => { load(); }, []);

  /* -----------------------------
     Load rules
     ----------------------------- */
  useEffect(() => {
    fetch("/api/lifecycle-rules")
      .then(res => res.json())
      .then(setRules);
  }, []);

  /* -----------------------------
     Promote rule
     ----------------------------- */
  const promoteRule = async (ruleId) => {
    await fetch(`/api/lifecycle-rules/${ruleId}/promote`, {
      method: "POST"
    });
    reloadRules();
  };

  /* -----------------------------
     Disable rule
     ----------------------------- */
  const disableRule = async (ruleId) => {
    await fetch(`/api/lifecycle-rules/${ruleId}/disable`, {
      method: "POST"
    });
    reloadRules();
  };

  /* -----------------------------
     Run simulation
     ----------------------------- */
  // const runSimulation = async (payload) => {
  //   const res = await fetch("/api/simulator/run/lifecycle", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(payload)
  //   });

  //   const result = await res.json();
  //   console.log("Simulation result:", result);

  //   // later: open result drawer / modal
  // };


  const runSimulation = async (payload) => {
  try {
    const res = await axios.post("http://localhost:8080/api/simulator/run/lifecycle", payload);
    setResult(res.data);
  } catch (error) {
    console.error("Simulation failed:", error);
  }
};

  /* -----------------------------
     Reload rules after actions
     ----------------------------- */
  const reloadRules = () => {
    fetch("/api/lifecycle-rules")
      .then(res => res.json())
      .then(setRules);
  };

  return (
    <>

    <LifecycleRuleForm onSubmit={(data) =>
        createRule(data).then(load)
      } />

      <LifecycleRuleTable
        rules={rules}
        onSimulate={setSelectedRule}
        onPromote={promoteRule}
        onDisable={disableRule}
      />

      {selectedRule && (
        <RuleSimulationModal
          open={Boolean(selectedRule)}
          ruleContext={selectedRule}
          onClose={() => setSelectedRule(null)}
          onRun={runSimulation}
          result={result}
        />
      )}
    </>
  );
}

