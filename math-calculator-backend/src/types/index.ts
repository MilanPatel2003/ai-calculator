export interface ImageData {
  image: string;
  dict_of_vars: Record<string, any>;
}

export interface AnalysisResult {
  expr: string;
  result: string;
  assign: boolean;
}

