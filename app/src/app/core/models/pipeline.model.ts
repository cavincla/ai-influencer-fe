export interface PipelineConfig {
  auto_publish: boolean;
  pipeline_hour: number;
  pipeline_topics_per_run: number;
  target_platforms: string[];
}

export interface PipelineTaskStatus {
  task_id: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'queued';
  result: string | null;
}
