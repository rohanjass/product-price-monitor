import sqlite3
import random
from datetime import datetime, timezone, timedelta

conn = sqlite3.connect('sql_app.db', timeout=10)
c = conn.cursor()

products = c.execute("SELECT id, latest_price FROM products").fetchall()
base_time = datetime.now(timezone.utc)

for prod_id, price in products:
    histories = c.execute("SELECT COUNT(*) FROM price_history WHERE product_id=?", (prod_id,)).fetchone()[0]
    if histories <= 1:
        for i in range(10, 0, -1):
            factor = 1 + random.uniform(-0.15, 0.15)
            hist_price = max(0.01, round(price * factor, 2))
            hist_time = base_time - timedelta(days=i)
            c.execute("INSERT INTO price_history (product_id, price, timestamp) VALUES (?, ?, ?)", 
                      (prod_id, hist_price, hist_time.isoformat()))

conn.commit()
conn.close()
print('Done mocking history')
