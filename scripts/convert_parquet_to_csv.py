import sys
import argparse
from pathlib import Path
import pyarrow.parquet as pq
import pandas as pd

parser = argparse.ArgumentParser(description="Convert MSMARCO Parquet files to CSV without modifying original files")
parser.add_argument("input_parquet", type=str, help="Path to input parquet file (e.g. gujval.parquet or gujtrain.parquet)")
parser.add_argument("--output-csv", type=str, default=None, help="Path to output CSV file (default: same name with .csv extension)")
parser.add_argument("--rows", type=str, default="1000", help="Number of rows to export (e.g. 1000, 10000, 50000, or 'all')")
args = parser.parse_args()

in_path = Path(args.input_parquet)
if not in_path.exists():
    print(f"Error: File '{in_path}' does not exist!")
    sys.exit(1)

out_path = Path(args.output_csv) if args.output_csv else in_path.with_suffix(".csv")
limit_val = None if args.rows.lower() == "all" else int(args.rows)

print("=" * 60)
print(f"CONVERTING PARQUET TO CSV")
print(f"Input File:  {in_path} (will remain unchanged)")
print(f"Output File: {out_path}")
print(f"Rows:        {'ALL' if limit_val is None else f'{limit_val:,}'}")
print("=" * 60)

pf = pq.ParquetFile(in_path)
total_rows_in_file = pf.metadata.num_rows
print(f"Total rows in parquet: {total_rows_in_file:,}")

rows_to_read = min(total_rows_in_file, limit_val) if limit_val else total_rows_in_file
print(f"Reading {rows_to_read:,} rows...")

# Stream in batches to avoid high memory spikes
all_rows = []
batch_size = 10000

for batch in pf.iter_batches(batch_size=batch_size):
    df_batch = batch.to_pandas()
    
    # Flatten complex nested dictionary columns (like passages) to readable strings
    for col in df_batch.columns:
        if df_batch[col].dtype == "object":
            df_batch[col] = df_batch[col].apply(lambda x: str(x) if isinstance(x, (dict, list)) else x)
            
    all_rows.append(df_batch)
    current_count = sum(len(b) for b in all_rows)
    print(f"  Processed {current_count:,} / {rows_to_read:,} rows...")
    
    if limit_val is not None and current_count >= limit_val:
        break

final_df = pd.concat(all_rows, ignore_index=True)
if limit_val is not None:
    final_df = final_df.iloc[:limit_val]

print(f"\nWriting to CSV: {out_path}...")
final_df.to_csv(out_path, index=False, encoding="utf-8-sig")

print("=" * 60)
print(f"SUCCESS: Saved {len(final_df):,} rows to '{out_path}'!")
print(f"Original file '{in_path}' is completely safe and unchanged.")
print("=" * 60)
