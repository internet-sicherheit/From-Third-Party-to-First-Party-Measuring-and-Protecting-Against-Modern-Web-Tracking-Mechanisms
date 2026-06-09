#!/usr/bin/env python3
"""
Module for query key extraction and feature augmentation.
Extracts query parameters from URLs and creates binary feature columns for analysis.
"""

import pandas as pd
import numpy as np
from urllib.parse import urlparse, parse_qs
from pathlib import Path
from collections import Counter
from typing import List, Dict, Set, Tuple
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import warnings
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for servers
import threading

# Suppress pandas performance warnings
warnings.filterwarnings('ignore', category=pd.errors.PerformanceWarning)

# Thread lock for matplotlib plotting (matplotlib is not thread-safe)
matplotlib_lock = threading.Lock()


def extract_query_keys(url: str) -> List[str]:
    """
    Parse query string and return sorted list of unique parameter keys.
    Handle malformed URLs gracefully.
    
    Args:
        url: URL string to parse
        
    Returns:
        List of unique query parameter keys, sorted alphabetically
    """
    if pd.isna(url) or not url or not isinstance(url, str):
        return []
    
    try:
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        # Extract keys and sort for consistency
        keys = sorted(query_params.keys())
        return keys
    except Exception:
        # Handle malformed URLs gracefully
        return []


def plot_key_distribution(key_counter: Counter, output_file: str = "query_keys_distribution.png"):
    """
    Plot the distribution of query parameter keys.
    Thread-safe version using matplotlib_lock.
    
    Args:
        key_counter: Counter object with query key frequencies
        output_file: Path to save the plot
    """
    # Use lock to ensure thread-safe plotting
    with matplotlib_lock:
        _plot_key_distribution_impl(key_counter, output_file)


def _plot_key_distribution_impl(key_counter: Counter, output_file: str):
    """
    Internal implementation of plot_key_distribution.
    Must be called with matplotlib_lock held.
    """
    print(f"\nPlotting query key distribution...")
    
    # Get all counts sorted from highest to lowest
    counts = sorted(key_counter.values(), reverse=True)
    
    if not counts:
        print("  Warning: No query keys to plot")
        return
    
    # Get top keys with names for labeling
    top_keys_with_counts = key_counter.most_common(30)
    
    # Create figure with multiple subplots for different views
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    
    # Plot 1: Full distribution (log scale)
    ax1 = axes[0, 0]
    ax1.plot(range(1, len(counts) + 1), counts, 'b-', alpha=0.6, linewidth=1)
    ax1.set_xlabel('Query Key Rank', fontsize=11)
    ax1.set_ylabel('Frequency (log scale)', fontsize=11)
    ax1.set_title(f'Query Key Distribution - All {len(counts):,} Keys (Log Scale)', fontsize=12, fontweight='bold')
    ax1.set_yscale('log')
    ax1.grid(True, alpha=0.3)
    ax1.set_xlim(1, len(counts))
    
    # Plot 2: Top keys with labels (horizontal bars)
    ax2 = axes[0, 1]
    top_n = min(25, len(top_keys_with_counts))
    top_names = [key for key, count in top_keys_with_counts[:top_n]]
    top_counts = [count for key, count in top_keys_with_counts[:top_n]]
    
    # Create horizontal bar chart (reversed so #1 is at top)
    y_pos = np.arange(len(top_names))
    ax2.barh(y_pos, top_counts, color='steelblue', alpha=0.7)
    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(top_names, fontsize=9)
    ax2.invert_yaxis()  # Highest at top
    ax2.set_xlabel('Frequency', fontsize=11)
    ax2.set_ylabel('Query Key', fontsize=11)
    ax2.set_title(f'Top {top_n} Query Keys by Frequency', fontsize=12, fontweight='bold')
    ax2.grid(True, alpha=0.3, axis='x')
    
    # Add count labels on bars
    for i, (name, count) in enumerate(zip(top_names, top_counts)):
        ax2.text(count, i, f' {count:,}', va='center', fontsize=8, fontweight='bold')
    
    # Plot 3: Distribution histogram with log bins
    ax3 = axes[1, 0]
    # Create logarithmic bins
    min_count = max(1, min(counts))
    max_count = max(counts)
    log_bins = np.logspace(np.log10(min_count), np.log10(max_count), 50)
    
    ax3.hist(counts, bins=log_bins, color='forestgreen', alpha=0.7, edgecolor='black', linewidth=0.5)
    ax3.set_xlabel('Frequency (log scale)', fontsize=11)
    ax3.set_ylabel('Number of Keys (log scale)', fontsize=11)
    ax3.set_title('Histogram of Query Key Frequencies (Log-binned)', fontsize=12, fontweight='bold')
    ax3.set_xscale('log')
    ax3.set_yscale('log')
    ax3.grid(True, alpha=0.3, which='both')
    
    # Plot 4: Cumulative distribution with Pareto cutoffs
    ax4 = axes[1, 1]
    cumsum = np.cumsum(counts)
    cumsum_pct = (cumsum / cumsum[-1]) * 100
    ax4.plot(range(1, len(cumsum_pct) + 1), cumsum_pct, 'r-', linewidth=2)
    
    # Calculate and annotate Pareto cutoffs (N80, N90)
    n80 = np.argmax(cumsum_pct >= 80) + 1  # +1 for 1-indexed
    n90 = np.argmax(cumsum_pct >= 90) + 1
    
    # Draw vertical lines at cutoffs
    ax4.axvline(x=n80, color='orange', linestyle='--', alpha=0.7, linewidth=2, label=f'N80 = {n80} keys')
    ax4.axvline(x=n90, color='purple', linestyle='--', alpha=0.7, linewidth=2, label=f'N90 = {n90} keys')
    
    # Draw horizontal lines
    ax4.axhline(y=80, color='gray', linestyle=':', alpha=0.4)
    ax4.axhline(y=90, color='gray', linestyle=':', alpha=0.4)
    
    # Annotate the intersection points
    ax4.plot(n80, 80, 'o', color='orange', markersize=8, zorder=5)
    ax4.plot(n90, 90, 'o', color='purple', markersize=8, zorder=5)
    ax4.text(n80, 75, f'{n80} keys\n(80%)', ha='center', fontsize=9, 
             bbox=dict(boxstyle='round', facecolor='orange', alpha=0.3))
    ax4.text(n90, 85, f'{n90} keys\n(90%)', ha='center', fontsize=9,
             bbox=dict(boxstyle='round', facecolor='purple', alpha=0.3))
    
    ax4.set_xlabel('Number of Top Keys', fontsize=11)
    ax4.set_ylabel('Cumulative % of Total Occurrences', fontsize=11)
    ax4.set_title('Cumulative Distribution with Pareto Cutoffs', fontsize=12, fontweight='bold')
    ax4.grid(True, alpha=0.3)
    ax4.legend(loc='lower right')
    ax4.set_xlim(1, len(cumsum_pct))  # Show full range
    ax4.set_ylim(0, 100)
    
    # Add summary statistics as text
    total_occurrences = sum(counts)
    median_count = np.median(counts)
    mean_count = np.mean(counts)
    
    fig.text(0.5, 0.02, 
             f'Summary: {len(counts):,} unique keys | {total_occurrences:,} total occurrences | '
             f'Mean: {mean_count:.1f} | Median: {median_count:.1f} | N80: {n80} keys | N90: {n90} keys',
             ha='center', fontsize=10, style='italic')
    
    plt.tight_layout(rect=[0, 0.03, 1, 1])
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    plt.close()
    
    print(f"  ✓ Saved distribution plot to {output_file}")
    print(f"  Statistics:")
    print(f"    - Total unique keys: {len(counts):,}")
    print(f"    - Total occurrences: {total_occurrences:,}")
    print(f"    - Mean frequency: {mean_count:.1f}")
    print(f"    - Median frequency: {median_count:.1f}")
    print(f"    - Max frequency: {max(counts):,}")
    print(f"    - Min frequency: {min(counts):,}")
    print(f"    - N80 (80% coverage): {n80} keys")
    print(f"    - N90 (90% coverage): {n90} keys")


def get_top_keys_across_categories(
    category_files: List[str], 
    url_column: str, 
    top_k: int = 100,
    key_source: str = 'both'
) -> Tuple[List[str], Dict[str, int]]:
    """
    Aggregate keys across specified category CSVs based on key_source parameter.
    
    Args:
        category_files: List of CSV file paths for each category
        url_column: Name of URL column to analyze (script_url or document_url)
        top_k: Number of top keys to return
        key_source: Which dataset(s) to use ('positive', 'negative', or 'both')
        
    Returns:
        Tuple of (top_k most frequent keys, key_counts dictionary)
    """
    # Filter category files based on key_source
    if key_source == 'positive':
        category_files = [f for f in category_files if 'positive' in os.path.basename(f).lower()]
        print(f"Extracting top {top_k} keys from POSITIVE dataset only...")
    elif key_source == 'negative':
        category_files = [f for f in category_files if 'negative' in os.path.basename(f).lower()]
        print(f"Extracting top {top_k} keys from NEGATIVE dataset only...")
    elif key_source == 'both':
        print(f"Extracting top {top_k} keys from BOTH datasets...")
    else:
        raise ValueError(f"Invalid key_source: {key_source}. Must be 'positive', 'negative', or 'both'")
    
    print(f"Processing {len(category_files)} category files...")
    
    key_counter = Counter()
    total_urls_processed = 0
    total_chunks_processed = 0
    
    for file_idx, file_path in enumerate(category_files, 1):
        if not os.path.exists(file_path):
            print(f"Warning: File not found: {file_path}")
            continue
            
        print(f"[{file_idx}/{len(category_files)}] Processing {os.path.basename(file_path)}...")
        
        try:
            # Read in chunks to handle large files
            chunk_size = 10000
            chunk_iter = pd.read_csv(file_path, chunksize=chunk_size, low_memory=False)
            
            file_chunks = 0
            file_urls = 0
            
            for chunk in chunk_iter:
                if url_column not in chunk.columns:
                    print(f"Warning: Column '{url_column}' not found in {file_path}")
                    continue
                
                # Extract keys from URLs in this chunk
                for url in chunk[url_column]:
                    keys = extract_query_keys(url)
                    key_counter.update(keys)
                    total_urls_processed += 1
                    file_urls += 1
                
                file_chunks += 1
                total_chunks_processed += 1
                
                # Progress update every 10 chunks
                if file_chunks % 10 == 0:
                    print(f"  Processed {file_chunks} chunks, {file_urls:,} URLs from this file...")
                    
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            continue
        
        print(f"  Completed {os.path.basename(file_path)}: {file_urls:,} URLs processed")
    
    print(f"\nQuery key extraction summary:")
    print(f"  Total URLs processed: {total_urls_processed:,}")
    print(f"  Total chunks processed: {total_chunks_processed:,}")
    print(f"  Found {len(key_counter):,} unique query parameter keys")

    # Plot the distribution of all keys before selecting top_k
    plot_file = f"query_keys_distribution_{key_source}_{top_k}.png"
    plot_key_distribution(key_counter, plot_file)
    
    # Get top k keys
    top_keys = [key for key, count in key_counter.most_common(top_k)]
    print(f"\n  Selected top {len(top_keys)} most frequent keys (source: {key_source})")
    
    # Return both the keys and the full counter for efficient counting later
    return top_keys, dict(key_counter)


def augment_chunk_with_features(chunk_data, url_column: str, keys: List[str]):
    """
    Augment a single chunk with query key features.
    
    Args:
        chunk_data: DataFrame chunk to augment
        url_column: Name of URL column to analyze
        keys: List of query parameter keys to create features for
        
    Returns:
        Augmented DataFrame chunk
    """
    # Create all features at once to avoid DataFrame fragmentation
    new_features = {}
    
    for key in keys:
        feature_name = f"has_{key}"
        new_features[feature_name] = chunk_data[url_column].apply(
            lambda url: 1 if key in extract_query_keys(url) else 0
        )
    
    # Create new DataFrame with all features at once
    augmented_chunk = pd.concat([chunk_data, pd.DataFrame(new_features)], axis=1)
    return augmented_chunk


def augment_with_has_key_features(input_csv: str, url_column: str, keys: List[str], output_csv: str, force: bool = False):
    """
    For each key in keys, add has_{key} column: 1 if key present in URL's query string, else 0.
    
    Args:
        input_csv: Path to input CSV file
        url_column: Name of URL column to analyze
        keys: List of query parameter keys to create features for
        output_csv: Path to output augmented CSV file
        force: If True, overwrite existing output file (default: False)
    """
    # Check if output file already exists
    if os.path.exists(output_csv) and not force:
        print(f"  ⚠ Skipping {os.path.basename(output_csv)} - file already exists")
        return
    
    print(f"Augmenting {os.path.basename(input_csv)} with {len(keys)} query key features...")
    
    # Create output directory if needed
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    
    chunk_size = 10000
    first_chunk = True
    total_rows = 0
    chunk_count = 0
    
    chunk_iter = pd.read_csv(input_csv, chunksize=chunk_size, low_memory=False)
    
    for chunk in chunk_iter:
        if url_column not in chunk.columns:
            print(f"Error: Column '{url_column}' not found in {input_csv}")
            return
        
        chunk_count += 1
        
        # Augment chunk with all features at once
        augmented_chunk = augment_chunk_with_features(chunk, url_column, keys)
        
        # Write chunk to output file
        if first_chunk:
            augmented_chunk.to_csv(output_csv, index=False)
            first_chunk = False
        else:
            augmented_chunk.to_csv(output_csv, mode='a', header=False, index=False)
        
        total_rows += len(chunk)
        
        # Progress update every 5 chunks
        if chunk_count % 5 == 0:
            print(f"  Processed {chunk_count} chunks, {total_rows:,} rows...")
    
    print(f"  Completed {os.path.basename(output_csv)}: {total_rows:,} rows with {len(keys)} additional features")


def process_url_experiment(
    data_dir: str, 
    output_dir: str, 
    top_k: int = 100,
    key_source: str = 'both',
    force: bool = False
):
    """
    Process URL experiment with positive and negative datasets.
    
    Args:
        data_dir: Directory containing the CSV files
        output_dir: Directory to write augmented CSV files
        top_k: Number of top keys to extract
        key_source: Which dataset(s) to use for key selection ('positive', 'negative', or 'both')
        force: If True, overwrite existing output files
    """
    print(f"\n{'='*60}")
    print(f"Processing URL experiment (top_k={top_k}, source={key_source})")
    print(f"{'='*60}")
    
    # Get the dataset files
    positive_file = os.path.join(data_dir, "positive_train.csv")
    negative_file = os.path.join(data_dir, "negative_train.csv")
    
    dataset_files = []
    if os.path.exists(positive_file):
        dataset_files.append(positive_file)
    if os.path.exists(negative_file):
        dataset_files.append(negative_file)
    
    if not dataset_files:
        print(f"Error: No dataset files found in {data_dir}")
        print("Expected files: positive_train.csv, negative_train.csv")
        return
    
    print(f"Found {len(dataset_files)} dataset files to process:")
    for file_path in dataset_files:
        print(f"  - {os.path.basename(file_path)}")
    
    # Get top keys across all datasets (single pass with Counter)
    print(f"\nStep 1: Extracting top {top_k} query keys from {key_source} dataset(s)...")
    top_keys, key_counts = get_top_keys_across_categories(dataset_files, "url", top_k, key_source)
    
    # Write most common keys file
    print(f"\nStep 2: Writing most common keys to file...")
    keys_output_file = f"most_common_queryKeys_{key_source}_{top_k}.txt"
    
    print(f"  Writing results to {keys_output_file}...")
    with open(keys_output_file, 'w') as f:
        f.write("Query Parameter Key Rankings\n")
        f.write("=" * 50 + "\n")
        f.write(f"Source: {key_source}, Top K: {top_k}\n")
        f.write("=" * 50 + "\n\n")
        for i, key in enumerate(top_keys, 1):
            total_count = key_counts.get(key, 0)
            f.write(f"{i:3d}. {key}: {total_count:,} occurrences\n")
    
    print(f"  ✓ Wrote {keys_output_file}")
    
    # Augment each dataset CSV using parallel processing
    print(f"\nStep 3: Augmenting dataset CSVs with query key features...")
    
    def augment_single_dataset(dataset_file):
        dataset_name = os.path.basename(dataset_file).replace('.csv', '')
        output_file = os.path.join(output_dir, f"{dataset_name}_with_query_keys_{key_source}_{top_k}.csv")
        augment_with_has_key_features(dataset_file, "url", top_keys, output_file, force=force)
        return dataset_name
    
    # Use ThreadPoolExecutor for parallel CSV augmentation
    max_workers = min(4, len(dataset_files))  # Reduced workers since we only have 2 files
    print(f"  Using {max_workers} threads for parallel CSV augmentation...")
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_file = {executor.submit(augment_single_dataset, dataset_file): dataset_file 
                         for dataset_file in dataset_files}
        
        completed = 0
        for future in as_completed(future_to_file):
            dataset_name = future.result()
            completed += 1
            print(f"  [{completed}/{len(dataset_files)}] Completed {dataset_name}...")
    
    print(f"\n✓ URL experiment completed successfully!")
    print(f"  - Generated {keys_output_file}")
    print(f"  - Generated {len(dataset_files)} augmented CSV files in {output_dir}/")


def main():
    """Main function to run query key extraction and feature augmentation."""
    print("="*80)
    print("QUERY KEY EXTRACTION AND FEATURE AUGMENTATION")
    print("="*80)
    
    # Configuration
    data_dir = "data_02022026"
    output_dir = "features_data"
    top_k = 100
    key_source = 'both'
    
    # Check if data directory exists
    if not os.path.exists(data_dir):
        print(f"Error: Data directory not found: {data_dir}")
        print("Please ensure the data directory contains urls_positive_set.csv and urls_negative_set.csv")
        return
    
    # Process the URL experiment
    print(f"\n{'='*80}")
    print("PROCESSING URL DATASETS")
    print(f"{'='*80}")
    
    process_url_experiment(data_dir, output_dir, top_k, key_source)
    
    print(f"\n{'='*80}")
    print("EXPERIMENT COMPLETED SUCCESSFULLY!")
    print(f"{'='*80}")
    print("\nGenerated files:")
    print(f"  ✓ most_common_queryKeys_{key_source}_{top_k}.txt")
    print(f"  ✓ {output_dir}/urls_positive_set_with_query_keys_{key_source}_{top_k}.csv")
    print(f"  ✓ {output_dir}/urls_negative_set_with_query_keys_{key_source}_{top_k}.csv")
    
    print(f"\nTotal datasets processed: 2 (positive and negative)")
    print("Ready to proceed with analysis!")


if __name__ == "__main__":
    main()
