package com.packsure.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rule_evaluations")
public class RuleEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Inspection inspection;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rule_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Rule rule;

    @Column(length = 20)
    private String ruleVersion;

    @Column(nullable = false, length = 30)
    private String result; // PASS, REVIEW, POTENTIAL_ISSUE, NOT_APPLICABLE

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declaration_id")
    private Declaration declaration;

    public RuleEvaluation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Inspection getInspection() { return inspection; }
    public void setInspection(Inspection inspection) { this.inspection = inspection; }

    public Rule getRule() { return rule; }
    public void setRule(Rule rule) { this.rule = rule; }

    public String getRuleVersion() { return ruleVersion; }
    public void setRuleVersion(String ruleVersion) { this.ruleVersion = ruleVersion; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }

    public Declaration getDeclaration() { return declaration; }
    public void setDeclaration(Declaration declaration) { this.declaration = declaration; }
}
