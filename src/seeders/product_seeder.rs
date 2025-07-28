use mysql_async::Pool;
use mysql_async::prelude::*;

pub async fn seed_products(pool: &Pool) -> Result<(), Box<dyn std::error::Error>> {
    let mut conn = pool.get_conn().await?;

    for i in 1..=200 {
        let nama = format!("Produk {}", i);
        let harga: f64 = 1000.0 + (i as f64 * 100.0); // harga meningkat 100 per produk
        let stok: i32 = (i % 50) + 1; // stok akan looping dari 1 sampai 50
        let category_id = 1;

        conn.exec_drop(
            "INSERT INTO barang (nama, harga, stok, category_id) VALUES (?, ?, ?, ?)",
            (nama, harga, stok, category_id),
        )
        .await?;
    }

    Ok(())
}
