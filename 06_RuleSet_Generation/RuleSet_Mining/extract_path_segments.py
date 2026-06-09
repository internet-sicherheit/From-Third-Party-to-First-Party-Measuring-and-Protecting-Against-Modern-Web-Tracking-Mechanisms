#!/usr/bin/env python3
"""
Extract path segments from URLs and create binary features.

Path segments are the parts of the URL path (e.g., /track, /analytics, /pixel).
This script identifies the top path segments that are more common in tracking
(positive) URLs than non-tracking (negative) URLs.
"""

import pandas as pd
import numpy as np
from urllib.parse import urlparse
from collections import Counter, defaultdict
from typing import List, Tuple, Dict
import os


def extract_path_segments(url: str) -> List[str]:
    """
    Parse URL and extract individual path segments.
    Handle malformed URLs gracefully.
    
    Args:
        url: URL string to parse
        
    Returns:
        List of individual path segments (e.g., ['/track', '/analytics'])
        Including both individual segments and their base paths
    """
    if pd.isna(url) or not url or not isinstance(url, str):
        return []
    
    try:
        parsed = urlparse(url)
        path = parsed.path
        
        if not path:
            return []
        
        # Split path into segments
        segments = [seg for seg in path.split('/') if seg]
        
        if not segments:
            return []
        
        # Get individual segments with leading slash
        path_segments = ['/' + seg for seg in segments]
        
        # Also include the base path (first segment)
        if len(path_segments) > 0:
            path_segments.append('/' + segments[0])
        
        return path_segments
    
    except Exception:
        # Handle malformed URLs gracefully
        return []


def get_path_segment_stats(positive_csv: str, negative_csv: str, url_column: str = 'url', top_k: int = 100) -> Tuple[List[str], Dict[str, int], Dict[str, int]]:
    """
    Extract path segment statistics from positive and negative datasets.
    
    Args:
        positive_csv: Path to positive class CSV file
        negative_csv: Path to negative class CSV file
        url_column: Name of the URL column
        top_k: Number of top segments to return
    
    Returns:
        Tuple of (top path segments, positive counts, negative counts)
    """
    print(f"Extracting path segments from {url_column} column...")
    
    pos_counter = Counter()
    neg_counter = Counter()
    
    total_urls_processed = 0
    
    # Process positive dataset
    print(f"Processing positive dataset...")
    try:
        chunk_size = 10000
        chunk_iter = pd.read_csv(positive_csv, chunksize=chunk_size, low_memory=False)
        
        file_urls = 0
        chunk_count = 0
        
        for chunk in chunk_iter:
            if url_column not in chunk.columns:
                print(f"Warning: Column '{url_column}' not found in {positive_csv}")
                continue
            
            for url in chunk[url_column]:
                segments = extract_path_segments(url)
                pos_counter.update(segments)
                file_urls += 1
                total_urls_processed += 1
            
            chunk_count += 1
            
            if chunk_count % 10 == 0:
                print(f"  Processed {chunk_count} chunks, {file_urls:,} URLs...")
        
        print(f"  Completed positive dataset: {file_urls:,} URLs processed")
        print(f"  Found {len(pos_counter):,} unique path segments")
        
    except Exception as e:
        print(f"Error processing positive dataset: {e}")
    
    # Process negative dataset
    print(f"\nProcessing negative dataset...")
    try:
        chunk_size = 10000
        chunk_iter = pd.read_csv(negative_csv, chunksize=chunk_size, low_memory=False)
        
        file_urls = 0
        chunk_count = 0
        
        for chunk in chunk_iter:
            if url_column not in chunk.columns:
                print(f"Warning: Column '{url_column}' not found in {negative_csv}")
                continue
            
            for url in chunk[url_column]:
                segments = extract_path_segments(url)
                neg_counter.update(segments)
                file_urls += 1
                total_urls_processed += 1
            
            chunk_count += 1
            
            if chunk_count % 10 == 0:
                print(f"  Processed {chunk_count} chunks, {file_urls:,} URLs...")
        
        print(f"  Completed negative dataset: {file_urls:,} URLs processed")
        print(f"  Found {len(neg_counter):,} unique path segments")
        
    except Exception as e:
        print(f"Error processing negative dataset: {e}")
    
    print(f"\nTotal URLs processed: {total_urls_processed:,}")
    
    # Calculate lift ratios for all segments
    # Lift = (frequency in positive) / (frequency in negative)
    # We want segments with high lift (more common in tracking URLs)
    # Only consider segments that appear in BOTH positive AND negative
    # with minimum occurrence threshold in negative class for statistical significance
    min_neg_count = 5  # Minimum 5 occurrences in negative class for statistical significance
    
    print(f"\nCalculating lift ratios (positive_freq / negative_freq)...")
    print(f"Filtering to segments with >= {min_neg_count} occurrences in negative class for statistical significance...")
    
    all_segments = set(pos_counter.keys()) | set(neg_counter.keys())
    lift_scores = {}
    
    for segment in all_segments:
        pos_count = pos_counter.get(segment, 0)
        neg_count = neg_counter.get(segment, 0)
        
        # Only calculate lift for segments that appear in both classes
        # with sufficient occurrences in negative class for statistical reliability
        if pos_count > 0 and neg_count >= min_neg_count:
            lift_scores[segment] = pos_count / neg_count
    
    # Filter segments that appear in both positive and negative
    # Sort by lift score (descending), then by frequency in positive
    segments_with_lift = [(seg, lift, pos_counter.get(seg, 0), neg_counter.get(seg, 0))
                         for seg, lift in lift_scores.items()]
    
    # Sort by lift (descending), then by positive frequency
    segments_with_lift.sort(key=lambda x: (-x[1], -x[2]))
    
    # Get top k segments
    top_segments = [seg[0] for seg in segments_with_lift[:top_k]]
    
    print(f"\nSelected top {len(top_segments)} path segments by lift ratio")
    
    return top_segments, dict(pos_counter), dict(neg_counter)


def augment_chunk_with_path_features(chunk_data, url_column: str, path_segments: List[str]):
    """
    Augment a single chunk with path segment features.
    
    Args:
        chunk_data: DataFrame chunk to augment
        url_column: Name of URL column to analyze
        path_segments: List of path segments to create features for
        
    Returns:
        Augmented DataFrame chunk
    """
    new_features = {}
    
    for segment in path_segments:
        # Sanitize segment for column name (replace / with _)
        feature_name = f"path_{segment.replace('/', '_').replace('-', '_').replace('.', '_')}"
        new_features[feature_name] = chunk_data[url_column].apply(
            lambda url: 1 if segment in extract_path_segments(url) else 0
        )
    
    # Create new DataFrame with all features at once
    augmented_chunk = pd.concat([chunk_data, pd.DataFrame(new_features)], axis=1)
    return augmented_chunk


def augment_with_path_features(input_csv: str, url_column: str, path_segments: List[str], output_csv: str):
    """
    Add binary path segment features to each row: 1 if segment present in URL path, else 0.
    
    Args:
        input_csv: Path to input CSV file
        url_column: Name of URL column to analyze
        path_segments: List of path segments to create features for
        output_csv: Path to output augmented CSV file
    """
    print(f"Augmenting {os.path.basename(input_csv)} with {len(path_segments)} path segment features...")
    
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
        augmented_chunk = augment_chunk_with_path_features(chunk, url_column, path_segments)
        
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
    
    print(f"  Completed {os.path.basename(output_csv)}: {total_rows:,} rows with {len(path_segments)} additional path features")


def process_path_segments(positive_csv: str, negative_csv: str, output_dir: str, top_k: int = 100):
    """
    Process path segment extraction and feature augmentation.
    
    Args:
        positive_csv: Path to positive class CSV file
        negative_csv: Path to negative class CSV file
        output_dir: Directory to write augmented CSV files
        top_k: Number of top path segments to extract
    """
    print(f"\n{'='*60}")
    print(f"Processing Path Segment Extraction")
    print(f"{'='*60}")
    
    if not os.path.exists(positive_csv):
        print(f"Error: Positive file not found: {positive_csv}")
        return
    
    if not os.path.exists(negative_csv):
        print(f"Error: Negative file not found: {negative_csv}")
        return
    
    # Step 1: Extract path segment statistics
    print(f"\nStep 1: Extracting top {top_k} path segments by lift ratio...")
    top_segments, pos_counts, neg_counts = get_path_segment_stats(
        positive_csv, negative_csv, url_column='url', top_k=top_k
    )
    
    if len(top_segments) < top_k:
        print(f"  Note: Found only {len(top_segments)} segments with non-zero counts in both classes (requested {top_k})")
    else:
        print(f"  Found {len(top_segments)} segments with meaningful lift ratios")
    
    # Step 2: Write most common path segments to file
    print(f"\nStep 2: Writing most common path segments to file...")
    segments_output_file = "most_common_path_segments.txt"
    
    with open(segments_output_file, 'w') as f:
        f.write("Path Segment Rankings (Sorted by Lift Ratio)\n")
        f.write("Only segments with >= 5 occurrences in negative class (statistical significance)\n")
        f.write("=" * 70 + "\n\n")
        f.write("Format: rank. segment | positive_count | negative_count | lift_ratio\n\n")
        
        if not top_segments:
            f.write("No path segments found that appear in both classes.\n")
        else:
            for i, segment in enumerate(top_segments, 1):
                pos_count = pos_counts.get(segment, 0)
                neg_count = neg_counts.get(segment, 0)
                lift_ratio = pos_count / neg_count if neg_count > 0 else 0.0
                lift_str = f"{lift_ratio:.2f}"
                
                f.write(f"{i:3d}. {segment:<50} | pos: {pos_count:6d} | neg: {neg_count:6d} | lift: {lift_str}\n")
    
    print(f"  ✓ Wrote {segments_output_file}")
    
    # Step 3: Augment CSV files with path segment features
    print(f"\nStep 3: Augmenting CSV files with path segment features...")
    
    positive_output = os.path.join(output_dir, os.path.basename(positive_csv).replace('.csv', '_with_path_segments.csv'))
    negative_output = os.path.join(output_dir, os.path.basename(negative_csv).replace('.csv', '_with_path_segments.csv'))
    
    # Augment positive dataset
    augment_with_path_features(positive_csv, 'url', top_segments, positive_output)
    
    # Augment negative dataset
    augment_with_path_features(negative_csv, 'url', top_segments, negative_output)
    
    print(f"\n✓ Path segment extraction completed successfully!")
    print(f"  - Generated {segments_output_file}")
    print(f"  - Generated {positive_output}")
    print(f"  - Generated {negative_output}")


def main():
    """Main function to run path segment extraction and feature augmentation."""
    print("="*80)
    print("PATH SEGMENT EXTRACTION AND FEATURE AUGMENTATION")
    print("="*80)
    
    # Configuration
    positive_csv = "data/urls_positive_set.csv"
    negative_csv = "data/urls_negative_set.csv"
    output_dir = "features_data"
    top_k = 100
    
    # Check if data directory exists
    if not os.path.exists("data"):
        print(f"Error: Data directory not found")
        print("Please ensure the data directory contains urls_positive_set.csv and urls_negative_set.csv")
        return
    
    # Process path segments
    process_path_segments(positive_csv, negative_csv, output_dir, top_k)
    
    print(f"\n{'='*80}")
    print("EXPERIMENT COMPLETED SUCCESSFULLY!")
    print(f"{'='*80}")
    print("\nGenerated files:")
    print(f"  ✓ most_common_path_segments.txt")
    print(f"  ✓ {output_dir}/urls_positive_set_with_path_segments.csv")
    print(f"  ✓ {output_dir}/urls_negative_set_with_path_segments.csv")


if __name__ == "__main__":
    main()

