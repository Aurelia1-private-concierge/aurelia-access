// Background Agents Index
// Central registry for all background agents

export * from './types';

// Agent configurations
export { travelIntelligenceConfig, runTravelIntelligenceAgent } from './travel-intelligence-agent';
export { experienceCuratorConfig, runExperienceCuratorAgent } from './experience-curator-agent';
export { marketIntelligenceConfig, runMarketIntelligenceAgent } from './market-intelligence-agent';
export { proactiveServiceConfig, runProactiveServiceAgent } from './proactive-service-agent';
export { partnerOperationsConfig, runPartnerOperationsAgent } from './partner-operations-agent';

import { travelIntelligenceConfig } from './travel-intelligence-agent';
import { experienceCuratorConfig } from './experience-curator-agent';
import { marketIntelligenceConfig } from './market-intelligence-agent';
import { proactiveServiceConfig } from './proactive-service-agent';
import { partnerOperationsConfig } from './partner-operations-agent';

import type { AgentConfig } from './types';

// All available agents
export const backgroundAgents: AgentConfig[] = [
  travelIntelligenceConfig,
  experienceCuratorConfig,
  marketIntelligenceConfig,
  proactiveServiceConfig,
  partnerOperationsConfig,
];

// Get agent by ID
export function getAgentById(id: string): AgentConfig | undefined {
  return backgroundAgents.find(agent => agent.id === id);
}

// Get agents by category
export function getAgentsByCategory(category: AgentConfig['category']): AgentConfig[] {
  return backgroundAgents.filter(agent => agent.category === category);
}

// Get active agents
export function getActiveAgents(): AgentConfig[] {
  return backgroundAgents.filter(agent => agent.isActive);
}
