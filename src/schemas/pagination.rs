use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Pagination {
    pub page: Option<usize>,
    pub limit: Option<usize>,
    pub search: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginationMeta {
    pub current_page: usize,
    pub limit: usize,
    pub total: u64,
    pub total_pages: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub pagination: PaginationMeta,
}
