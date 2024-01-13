export type PlanDataType = {
  id: number;
  name: string;
  year: number;
  status: string;
  estimated_budget: number;
  created_at: string;
  updated_at: string;
}

export type PlanItemDataType = {
  id: number;
  category_id: number | null;
  uasg: number;
  item_number: number;
  item_code: number;
  description: string;
  quantity: number;
  unity: string;
  estimated_total_value: number;
  priority_level: string;
  desired_date: Date;
  created_at: string;
  updated_at: string;
}
