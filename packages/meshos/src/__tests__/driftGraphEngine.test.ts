/**
 * Tests for MeshOS Drift Graph Engine
 */

import {
  getContradictionGraphSnapshot,
  saveContradictionGraph,
  filterGraphBySeverity,
  getTopConflictSystems,
  getTopSevereContradictions,
  driftReportsToContradictions,
} from '../driftGraphEngine';
import type { DriftReport, MeshContradictionGraph } from '../types';

describe('MeshOS Drift Graph Engine', () => {
  describe('getContradictionGraphSnapshot', () => {
    it('should generate a contradiction graph', async () => {
      const graph = await getContradictionGraphSnapshot();

      expect(graph).toBeDefined();
      expect(graph.nodes).toBeInstanceOf(Array);
      expect(graph.edges).toBeInstanceOf(Array);
      expect(graph.generatedAt).toBeDefined();
      expect(graph.totalContradictions).toBe(graph.edges.length);
    });

    it('should have valid node structure', async () => {
      const graph = await getContradictionGraphSnapshot();

      expect(graph.nodes.length).toBeGreaterThan(0);

      graph.nodes.forEach((node) => {
        expect(node.system).toBeDefined();
        expect(typeof node.contradictionCount).toBe('number');
        expect(node.contradictionCount).toBeGreaterThan(0);
        expect(['low', 'medium', 'high', 'critical']).toContain(node.severity);
      });
    });

    it('should have valid edge structure', async () => {
      const graph = await getContradictionGraphSnapshot();

      expect(graph.edges.length).toBeGreaterThan(0);

      graph.edges.forEach((edge) => {
        expect(edge.from).toBeDefined();
        expect(edge.to).toBeDefined();
        expect(edge.contradictionType).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(edge.severity);
        expect(edge.humanSummary).toBeDefined();
        expect(edge.detectedAt).toBeDefined();
      });
    });

    it('should have nodes matching edge systems', async () => {
      const graph = await getContradictionGraphSnapshot();

      const systemsInEdges = new Set<string>();
      graph.edges.forEach((edge) => {
        systemsInEdges.add(edge.from);
        systemsInEdges.add(edge.to);
      });

      const systemsInNodes = new Set(graph.nodes.map((n) => n.system));

      systemsInEdges.forEach((system) => {
        expect(systemsInNodes.has(system)).toBe(true);
      });
    });

    it('should complete within reasonable time', async () => {
      const startTime = Date.now();
      await getContradictionGraphSnapshot();
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('filterGraphBySeverity', () => {
    let testGraph: MeshContradictionGraph;

    beforeEach(async () => {
      testGraph = await getContradictionGraphSnapshot();
    });

    it('should filter to critical severity only', () => {
      const filtered = filterGraphBySeverity(testGraph, 'critical');

      filtered.edges.forEach((edge) => {
        expect(edge.severity).toBe('critical');
      });
    });

    it('should filter to high+ severity', () => {
      const filtered = filterGraphBySeverity(testGraph, 'high');

      filtered.edges.forEach((edge) => {
        expect(['high', 'critical']).toContain(edge.severity);
      });
    });

    it('should filter to medium+ severity', () => {
      const filtered = filterGraphBySeverity(testGraph, 'medium');

      filtered.edges.forEach((edge) => {
        expect(['medium', 'high', 'critical']).toContain(edge.severity);
      });
    });

    it('should include all when filtering by low', () => {
      const filtered = filterGraphBySeverity(testGraph, 'low');

      expect(filtered.edges.length).toBe(testGraph.edges.length);
    });

    it('should update node counts after filtering', () => {
      const filtered = filterGraphBySeverity(testGraph, 'high');

      // Nodes should only include systems involved in high+ severity edges
      const systemsInEdges = new Set<string>();
      filtered.edges.forEach((edge) => {
        systemsInEdges.add(edge.from);
        systemsInEdges.add(edge.to);
      });

      filtered.nodes.forEach((node) => {
        expect(systemsInEdges.has(node.system)).toBe(true);
      });
    });
  });

  describe('getTopConflictSystems', () => {
    let testGraph: MeshContradictionGraph;

    beforeEach(async () => {
      testGraph = await getContradictionGraphSnapshot();
    });

    it('should return top 5 systems by default', () => {
      const topSystems = getTopConflictSystems(testGraph);

      expect(topSystems.length).toBeLessThanOrEqual(5);
    });

    it('should return systems ordered by contradiction count', () => {
      const topSystems = getTopConflictSystems(testGraph);

      for (let i = 1; i < topSystems.length; i++) {
        expect(topSystems[i - 1].contradictionCount).toBeGreaterThanOrEqual(
          topSystems[i].contradictionCount
        );
      }
    });

    it('should respect custom limit', () => {
      const top3 = getTopConflictSystems(testGraph, 3);

      expect(top3.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getTopSevereContradictions', () => {
    let testGraph: MeshContradictionGraph;

    beforeEach(async () => {
      testGraph = await getContradictionGraphSnapshot();
    });

    it('should return top 5 contradictions by default', () => {
      const topContradictions = getTopSevereContradictions(testGraph);

      expect(topContradictions.length).toBeLessThanOrEqual(5);
    });

    it('should return contradictions ordered by severity', () => {
      const topContradictions = getTopSevereContradictions(testGraph);

      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 };

      for (let i = 1; i < topContradictions.length; i++) {
        expect(severityWeight[topContradictions[i - 1].severity]).toBeGreaterThanOrEqual(
          severityWeight[topContradictions[i].severity]
        );
      }
    });

    it('should respect custom limit', () => {
      const top3 = getTopSevereContradictions(testGraph, 3);

      expect(top3.length).toBeLessThanOrEqual(3);
    });
  });

  describe('driftReportsToContradictions', () => {
    it('should convert drift reports to contradiction edges', () => {
      const reports: DriftReport[] = [
        {
          id: 'drift-001',
          systemsInvolved: ['Autopilot', 'CoachOS'],
          contradictionType: 'workload_energy_mismatch',
          severity: 'high',
          humanSummary: 'Test contradiction',
          detectedAt: new Date().toISOString(),
        },
        {
          id: 'drift-002',
          systemsInvolved: ['MAL', 'Identity'],
          contradictionType: 'lifecycle_identity_drift',
          severity: 'medium',
          humanSummary: 'Another test',
          detectedAt: new Date().toISOString(),
        },
      ];

      const edges = driftReportsToContradictions(reports);

      expect(edges.length).toBe(2);
      expect(edges[0].from).toBe('Autopilot');
      expect(edges[0].to).toBe('CoachOS');
      expect(edges[0].severity).toBe('high');
      expect(edges[1].from).toBe('MAL');
      expect(edges[1].to).toBe('Identity');
    });

    it('should filter out reports with less than 2 systems', () => {
      const reports: DriftReport[] = [
        {
          id: 'drift-001',
          systemsInvolved: ['Autopilot'],
          contradictionType: 'single_system',
          severity: 'low',
          humanSummary: 'Single system issue',
          detectedAt: new Date().toISOString(),
        },
        {
          id: 'drift-002',
          systemsInvolved: ['MAL', 'Identity'],
          contradictionType: 'multi_system',
          severity: 'medium',
          humanSummary: 'Multi-system issue',
          detectedAt: new Date().toISOString(),
        },
      ];

      const edges = driftReportsToContradictions(reports);

      expect(edges.length).toBe(1);
      expect(edges[0].from).toBe('MAL');
    });
  });

  describe('saveContradictionGraph', () => {
    it('should save drift reports for each edge', async () => {
      const savedReports: DriftReport[] = [];
      const mockSave = async (report: DriftReport) => {
        savedReports.push(report);
      };

      const graph = await getContradictionGraphSnapshot();
      await saveContradictionGraph(graph, mockSave);

      expect(savedReports.length).toBe(graph.edges.length);

      savedReports.forEach((report, idx) => {
        const edge = graph.edges[idx];
        expect(report.systemsInvolved).toEqual([edge.from, edge.to]);
        expect(report.contradictionType).toBe(edge.contradictionType);
        expect(report.severity).toBe(edge.severity);
        expect(report.humanSummary).toBe(edge.humanSummary);
      });
    });
  });

  describe('Integration test', () => {
    it('should generate, filter, and save graph', async () => {
      const savedReports: DriftReport[] = [];
      const mockSave = async (report: DriftReport) => {
        savedReports.push(report);
      };

      // Generate graph
      const graph = await getContradictionGraphSnapshot();
      expect(graph.edges.length).toBeGreaterThan(0);

      // Filter to high severity
      const filtered = filterGraphBySeverity(graph, 'high');
      expect(filtered.edges.length).toBeLessThanOrEqual(graph.edges.length);

      // Get top systems
      const topSystems = getTopConflictSystems(filtered, 3);
      expect(topSystems.length).toBeGreaterThan(0);

      // Save filtered graph
      await saveContradictionGraph(filtered, mockSave);
      expect(savedReports.length).toBe(filtered.edges.length);
    });
  });
});
