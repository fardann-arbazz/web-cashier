use std::{env, sync::Arc};

use mysql_async::{Opts, Pool};

pub async fn get_db_pool() -> Arc<Pool> {
    let url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = Pool::new(Opts::from_url(&url).expect("Invalid database URL"));
    Arc::new(pool)
}
