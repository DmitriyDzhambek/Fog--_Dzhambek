import sqlite3
from pathlib import Path
from datetime import datetime,timezone
DB_PATH=Path(__file__).resolve().parent/"trades.db"
def _now(): return datetime.now(timezone.utc).isoformat()
def init_db():
 with sqlite3.connect(DB_PATH) as c:
  c.execute("""CREATE TABLE IF NOT EXISTS trades(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,timestamp TEXT NOT NULL,ticker TEXT,side TEXT,action TEXT,advice TEXT,current_price REAL,reasoning TEXT,image_path TEXT,parent_trade_id INTEGER)""")
  c.execute("""CREATE TABLE IF NOT EXISTS user_profiles(user_id INTEGER PRIMARY KEY,deposit_rub REAL DEFAULT 2175,risk_per_trade_percent REAL DEFAULT 1,target_capital_rub REAL DEFAULT 16000000,style TEXT DEFAULT 'conservative',created_at TEXT,updated_at TEXT)""")
  c.execute("""CREATE TABLE IF NOT EXISTS trade_monitors(id INTEGER PRIMARY KEY AUTOINCREMENT,trade_id INTEGER NOT NULL,user_id INTEGER NOT NULL,ticker TEXT NOT NULL,side TEXT NOT NULL,entry_price REAL NOT NULL,target_price REAL,stop_price REAL,last_checked_price REAL,last_checked_at TEXT,is_active INTEGER DEFAULT 1,notified_target INTEGER DEFAULT 0,notified_stop INTEGER DEFAULT 0,last_notified_at TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)""")
  for q in ("ALTER TABLE trades ADD COLUMN parent_trade_id INTEGER","ALTER TABLE trade_monitors ADD COLUMN last_notified_at TEXT"):
   try:c.execute(q)
   except sqlite3.OperationalError:pass
  c.commit()
def get_user_profile(user_id):
 with sqlite3.connect(DB_PATH) as c:
  c.row_factory=sqlite3.Row;r=c.execute("SELECT * FROM user_profiles WHERE user_id=?",(user_id,)).fetchone()
 return dict(r) if r else None
def create_user_profile_if_missing(user_id):
 p=get_user_profile(user_id)
 if p:return p
 n=_now()
 with sqlite3.connect(DB_PATH) as c:c.execute("INSERT OR IGNORE INTO user_profiles(user_id,created_at,updated_at) VALUES(?,?,?)",(user_id,n,n));c.commit()
 return get_user_profile(user_id)
def update_user_profile(user_id,**kwargs):
 allowed={"deposit_rub","risk_per_trade_percent","target_capital_rub","style"};v={k:x for k,x in kwargs.items() if k in allowed};create_user_profile_if_missing(user_id)
 if v:
  v["updated_at"]=_now();a=",".join(k+"=?" for k in v)
  with sqlite3.connect(DB_PATH) as c:c.execute("UPDATE user_profiles SET "+a+" WHERE user_id=?",(*v.values(),user_id));c.commit()
 return get_user_profile(user_id)
def save_trade(user_id,timestamp,ticker,side,action,advice,current_price,reasoning,image_path,parent_trade_id=None):
 with sqlite3.connect(DB_PATH) as c:
  r=c.execute("INSERT INTO trades(user_id,timestamp,ticker,side,action,advice,current_price,reasoning,image_path,parent_trade_id) VALUES(?,?,?,?,?,?,?,?,?,?)",(user_id,timestamp,ticker,side,action,advice,current_price,reasoning,image_path,parent_trade_id));c.commit();return int(r.lastrowid)
def get_trade(trade_id):
 with sqlite3.connect(DB_PATH) as c:
  c.row_factory=sqlite3.Row;r=c.execute("SELECT * FROM trades WHERE id=?",(trade_id,)).fetchone()
 return dict(r) if r else None
def create_monitor(*,trade_id,user_id,ticker,side,entry_price,target_price,stop_price):
 n=_now()
 with sqlite3.connect(DB_PATH) as c:
  r=c.execute("INSERT INTO trade_monitors(trade_id,user_id,ticker,side,entry_price,target_price,stop_price,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",(trade_id,user_id,ticker.upper(),side.upper(),entry_price,target_price,stop_price,n,n));c.commit();return int(r.lastrowid)
def get_active_monitors():
 with sqlite3.connect(DB_PATH) as c:
  c.row_factory=sqlite3.Row;return [dict(x) for x in c.execute("SELECT * FROM trade_monitors WHERE is_active=1 ORDER BY id").fetchall()]
def update_monitor_price(monitor_id,price):
 n=_now()
 with sqlite3.connect(DB_PATH) as c:c.execute("UPDATE trade_monitors SET last_checked_price=?,last_checked_at=?,updated_at=? WHERE id=?",(price,n,n,monitor_id));c.commit()
def mark_monitor_notified(monitor_id,kind):
 col="notified_target" if kind=="target" else "notified_stop";n=_now()
 with sqlite3.connect(DB_PATH) as c:c.execute("UPDATE trade_monitors SET "+col+"=1,last_notified_at=?,updated_at=? WHERE id=?",(n,n,monitor_id));c.commit()
def get_last_notified_at(monitor_id):
 with sqlite3.connect(DB_PATH) as c:r=c.execute("SELECT last_notified_at FROM trade_monitors WHERE id=?",(monitor_id,)).fetchone()
 return r[0] if r else None
def deactivate_monitor(monitor_id):
 with sqlite3.connect(DB_PATH) as c:c.execute("UPDATE trade_monitors SET is_active=0,updated_at=? WHERE id=?",(_now(),monitor_id));c.commit()