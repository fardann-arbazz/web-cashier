// Helper function tuntuk menghitung pagination
pub fn calculate_pagination(page: Option<usize>, limit: Option<usize>) -> (usize, usize, usize) {
    let page = page.unwrap_or(1);
    let limit = limit.unwrap_or(10);
    let offset = (page - 1) * limit;

    (page, limit, offset)
}
