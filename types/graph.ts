import { Node, Edge, Position } from 'reactflow';
import { SWEPhase, QuestionProgress, ProgressState } from './progress';

// ============================================================================
// CORE GRAPH TYPES - Foundation for extensibility
// ============================================================================

export type GraphNodeType = 'phase' | 'question' | 'connector' | 'milestone';
export type GraphEdgeType = 'flow' | 'dependency' | 'related' | 'blocked';
export type GraphViewMode = 'overview' | 'detailed' | 'focused' | 'debug';
export type GraphLayoutType = 'horizontal' | 'vertical' | 'radial' | 'force' | 'hierarchical';

// ============================================================================
// NODE INTERFACES - Extensible node system
// ============================================================================

export interface BaseNodeData {
  id: string;
  label: string;
  type: GraphNodeType;
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'blocked' | 'error';
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: string;
    debugInfo?: any;
  };
  styling: {
    color?: string;
    size?: 'small' | 'medium' | 'large' | 'custom';
    customStyles?: Record<string, any>;
  };
  interactions: {
    clickable: boolean;
    hoverable: boolean;
    draggable: boolean;
    selectable: boolean;
  };
  analytics: {
    viewCount: number;
    hoverTime: number;
    clickCount: number;
    lastInteraction?: number;
  };
}

export interface PhaseNodeData extends BaseNodeData {
  type: 'phase';
  phase: SWEPhase;
  progress: number;
  questionsInPhase: string[];
  completedQuestions: number;
  totalQuestions: number;
  confidence: number;
  estimatedTime: number;
  dependencies: string[];
  children: string[]; // question node IDs
}

export interface QuestionNodeData extends BaseNodeData {
  type: 'question';
  questionId: string;
  parentPhase: SWEPhase;
  questionProgress: QuestionProgress;
  templateId: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTimeMinutes: number;
  isOptional: boolean;
  prerequisites: string[];
}

export interface ConnectorNodeData extends BaseNodeData {
  type: 'connector';
  sourceId: string;
  targetId: string;
  connectionType: GraphEdgeType;
  weight: number;
}

export interface MilestoneNodeData extends BaseNodeData {
  type: 'milestone';
  milestoneType: 'start' | 'checkpoint' | 'end' | 'decision';
  criteria: string[];
  progress: number;
}

export type GraphNodeData = PhaseNodeData | QuestionNodeData | ConnectorNodeData | MilestoneNodeData;

// ============================================================================
// EDGE INTERFACES - Connection system
// ============================================================================

export interface BaseEdgeData {
  id: string;
  type: GraphEdgeType;
  source: string;
  target: string;
  status: 'active' | 'inactive' | 'blocked' | 'highlighted';
  weight: number;
  metadata: {
    createdAt: number;
    debugInfo?: any;
  };
  styling: {
    animated?: boolean;
    color?: string;
    strokeWidth?: number;
    dashed?: boolean;
  };
  label?: string;
  labelPosition?: number;
}

export interface FlowEdgeData extends BaseEdgeData {
  type: 'flow';
  flowType: 'sequential' | 'parallel' | 'conditional';
  condition?: string;
}

export interface DependencyEdgeData extends BaseEdgeData {
  type: 'dependency';
  dependencyType: 'required' | 'optional' | 'blocking';
  strength: number;
}

export type GraphEdgeData = FlowEdgeData | DependencyEdgeData | BaseEdgeData;

// ============================================================================
// GRAPH STATE MANAGEMENT - Zustand store interfaces
// ============================================================================

export interface GraphState {
  // Core state
  nodes: Node<GraphNodeData>[];
  edges: Edge<GraphEdgeData>[];
  viewMode: GraphViewMode;
  layoutType: GraphLayoutType;
  
  // View state
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  selectedNodes: string[];
  focusedNode: string | null;
  hoveredNode: string | null;
  
  // UI state
  panels: {
    detailPanel: { open: boolean; nodeId?: string; position?: { x: number; y: number } };
    debugPanel: { open: boolean };
    controlPanel: { open: boolean };
    miniMap: { open: boolean };
  };
  
  // Performance state
  renderOptimization: {
    enableClustering: boolean;
    maxVisibleNodes: number;
    lodLevel: 'high' | 'medium' | 'low';
  };
  
  // Debug state
  debug: {
    enabled: boolean;
    showIds: boolean;
    showBounds: boolean;
    showPerformance: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
}

export interface GraphActions {
  // Node operations
  addNode: (node: Node<GraphNodeData>) => void;
  updateNode: (id: string, updates: Partial<GraphNodeData>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string) => void;
  focusNode: (id: string) => void;
  
  // Edge operations
  addEdge: (edge: Edge<GraphEdgeData>) => void;
  updateEdge: (id: string, updates: Partial<GraphEdgeData>) => void;
  removeEdge: (id: string) => void;
  
  // View operations
  setViewMode: (mode: GraphViewMode) => void;
  setLayoutType: (layout: GraphLayoutType) => void;
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  fitView: () => void;
  zoomToNode: (nodeId: string) => void;
  
  // Panel operations
  openDetailPanel: (nodeId: string, position?: { x: number; y: number }) => void;
  closeDetailPanel: () => void;
  toggleDebugPanel: () => void;
  
  // Batch operations
  batchUpdate: (updates: () => void) => void;
  resetGraph: () => void;
  
  // Progress integration
  syncWithProgressState: (progressState: ProgressState) => void;
  
  // Debug operations
  enableDebug: () => void;
  disableDebug: () => void;
  exportDebugData: () => any;
}

export type GraphStore = GraphState & GraphActions;

// ============================================================================
// LAYOUT SYSTEM - Extensible layout algorithms
// ============================================================================

export interface LayoutConfig {
  type: GraphLayoutType;
  direction: 'TB' | 'BT' | 'LR' | 'RL';
  spacing: {
    node: number;
    rank: number;
  };
  alignment: 'start' | 'center' | 'end';
  animate: boolean;
  animationDuration: number;
}

export interface LayoutAlgorithm {
  name: string;
  type: GraphLayoutType;
  calculate: (nodes: Node[], edges: Edge[], config: LayoutConfig) => {
    nodes: Node[];
    edges: Edge[];
  };
  validateConfig: (config: LayoutConfig) => boolean;
  getDefaultConfig: () => LayoutConfig;
}

// ============================================================================
// INTERACTION SYSTEM - Event handling
// ============================================================================

export interface GraphInteractionEvent {
  type: 'click' | 'hover' | 'drag' | 'zoom' | 'pan' | 'keypress';
  timestamp: number;
  nodeId?: string;
  edgeId?: string;
  position?: { x: number; y: number };
  metadata?: any;
}

export interface InteractionHandler {
  eventType: GraphInteractionEvent['type'];
  handler: (event: GraphInteractionEvent, state: GraphState) => void | Promise<void>;
  priority: number;
  conditions?: (event: GraphInteractionEvent, state: GraphState) => boolean;
}

// ============================================================================
// PLUGIN SYSTEM - Extensibility
// ============================================================================

export interface GraphPlugin {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
  
  // Lifecycle hooks
  onInstall?: (store: GraphStore) => void | Promise<void>;
  onUninstall?: (store: GraphStore) => void | Promise<void>;
  onStateChange?: (newState: GraphState, oldState: GraphState) => void;
  
  // Extensions
  nodeTypes?: Record<string, any>;
  edgeTypes?: Record<string, any>;
  layoutAlgorithms?: LayoutAlgorithm[];
  interactionHandlers?: InteractionHandler[];
  
  // UI extensions
  panels?: React.ComponentType[];
  toolbar?: React.ComponentType[];
  contextMenu?: React.ComponentType[];
}

// ============================================================================
// DEBUGGING & ANALYTICS
// ============================================================================

export interface DebugInfo {
  graphMetrics: {
    nodeCount: number;
    edgeCount: number;
    renderTime: number;
    memoryUsage: number;
  };
  performance: {
    fps: number;
    averageRenderTime: number;
    slowFrames: number;
  };
  interactions: {
    totalClicks: number;
    totalHovers: number;
    sessionTime: number;
  };
  errors: Array<{
    timestamp: number;
    type: string;
    message: string;
    stack?: string;
  }>;
}

export interface Analytics {
  trackEvent: (event: GraphInteractionEvent) => void;
  getMetrics: () => DebugInfo;
  exportData: () => any;
  reset: () => void;
}

// ============================================================================
// CONFIGURATION & THEMING
// ============================================================================

export interface GraphTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface GraphConfig {
  theme: GraphTheme;
  layout: LayoutConfig;
  performance: {
    enableVirtualization: boolean;
    maxRenderNodes: number;
    updateThrottleMs: number;
  };
  interactions: {
    enableKeyboardNavigation: boolean;
    enableTouchGestures: boolean;
    doubleClickZoom: boolean;
    panOnDrag: boolean;
  };
  debug: {
    enabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    showPerformanceMetrics: boolean;
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class GraphError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'GraphError';
  }
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  errorId?: string;
}

// ============================================================================
// EXPORTS - Make everything available
// ============================================================================

export type {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  Position as ReactFlowPosition
} from 'reactflow';