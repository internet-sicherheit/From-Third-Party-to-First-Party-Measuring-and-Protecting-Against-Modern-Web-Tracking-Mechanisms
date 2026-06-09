#!/usr/bin/env python3
"""
Script to evaluate blocking methods from negative and positive validation CSVs.
Outputs a CSV summary with coverage statistics and distinct FPG blocks.
"""

import csv
import os

def normalize_boolean(value):
    """Normalize boolean values to handle True/False and true/false."""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes')
    return False

def process_csv_file(csv_path, dataset_name):
    """Process a CSV file and return statistics."""
    print(f"Reading {csv_path}...")
    
    urls = []
    blocked_easylist = []
    blocked_easyprivacy = []
    blocked_custom = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            urls.append(row['url'])
            blocked_easylist.append(normalize_boolean(row['easylist']))
            blocked_easyprivacy.append(normalize_boolean(row['easyprivacy']))
            blocked_custom.append(normalize_boolean(row['custom']))
    
    total_urls = len(urls)
    print(f"  Total URLs: {total_urls:,}\n")
    
    # Count blocked URLs for each method
    easylist_blocked = sum(blocked_easylist)
    easyprivacy_blocked = sum(blocked_easyprivacy)
    custom_blocked = sum(blocked_custom)
    
    # Calculate percentages
    easylist_pct = (easylist_blocked / total_urls) * 100 if total_urls > 0 else 0
    easyprivacy_pct = (easyprivacy_blocked / total_urls) * 100 if total_urls > 0 else 0
    custom_pct = (custom_blocked / total_urls) * 100 if total_urls > 0 else 0
    
    # Calculate distinct blocks for each method
    # Distinct easylist: blocked by easylist but NOT by easyprivacy or custom
    distinct_easylist_blocked = sum(
        easylist and not easyprivacy and not custom 
        for easylist, easyprivacy, custom in zip(blocked_easylist, blocked_easyprivacy, blocked_custom)
    )
    distinct_easylist_pct = (distinct_easylist_blocked / total_urls) * 100 if total_urls > 0 else 0
    
    # Distinct easyprivacy: blocked by easyprivacy but NOT by easylist or custom
    distinct_easyprivacy_blocked = sum(
        easyprivacy and not easylist and not custom 
        for easylist, easyprivacy, custom in zip(blocked_easylist, blocked_easyprivacy, blocked_custom)
    )
    distinct_easyprivacy_pct = (distinct_easyprivacy_blocked / total_urls) * 100 if total_urls > 0 else 0
    
    # Distinct custom: blocked by custom but NOT by easylist or easyprivacy
    distinct_custom_blocked = sum(
        custom and not easylist and not easyprivacy 
        for custom, easylist, easyprivacy in zip(blocked_custom, blocked_easylist, blocked_easyprivacy)
    )
    distinct_custom_pct = (distinct_custom_blocked / total_urls) * 100 if total_urls > 0 else 0
    
    return {
        'dataset': dataset_name,
        'total_urls': total_urls,
        'easylist_blocked': easylist_blocked,
        'easylist_pct': easylist_pct,
        'distinct_easylist_blocked': distinct_easylist_blocked,
        'distinct_easylist_pct': distinct_easylist_pct,
        'easyprivacy_blocked': easyprivacy_blocked,
        'easyprivacy_pct': easyprivacy_pct,
        'distinct_easyprivacy_blocked': distinct_easyprivacy_blocked,
        'distinct_easyprivacy_pct': distinct_easyprivacy_pct,
        'custom_blocked': custom_blocked,
        'custom_pct': custom_pct,
        'distinct_custom_blocked': distinct_custom_blocked,
        'distinct_custom_pct': distinct_custom_pct,
    }

def main():
    # Define input files
    script_dir = os.path.dirname(os.path.abspath(__file__))
    negative_csv = os.path.join(script_dir, 'negative_test.csv')
    positive_csv = os.path.join(script_dir, 'positive_test.csv')
    
    # Process both CSV files
    negative_stats = process_csv_file(negative_csv, 'negative_validation')
    positive_stats = process_csv_file(positive_csv, 'positive_validation')
    
    # Prepare output CSV
    output_csv = os.path.join(script_dir, 'evaluation_summary.csv')
    
    print(f"\nWriting summary to {output_csv}...")
    
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Write header
        writer.writerow([
            'dataset',
            'method',
            'coverage_pct',
            'blocked_count',
            'distinct_blocked',
            'distinct_pct'
        ])
        
        # Write negative validation stats
        writer.writerow([
            negative_stats['dataset'],
            'easylist',
            f"{negative_stats['easylist_pct']:.2f}",
            negative_stats['easylist_blocked'],
            negative_stats['distinct_easylist_blocked'],
            f"{negative_stats['distinct_easylist_pct']:.2f}"
        ])
        writer.writerow([
            negative_stats['dataset'],
            'easyprivacy',
            f"{negative_stats['easyprivacy_pct']:.2f}",
            negative_stats['easyprivacy_blocked'],
            negative_stats['distinct_easyprivacy_blocked'],
            f"{negative_stats['distinct_easyprivacy_pct']:.2f}"
        ])
        writer.writerow([
            negative_stats['dataset'],
            'custom',
            f"{negative_stats['custom_pct']:.2f}",
            negative_stats['custom_blocked'],
            negative_stats['distinct_custom_blocked'],
            f"{negative_stats['distinct_custom_pct']:.2f}"
        ])
        
        # Write positive validation stats
        writer.writerow([
            positive_stats['dataset'],
            'easylist',
            f"{positive_stats['easylist_pct']:.2f}",
            positive_stats['easylist_blocked'],
            positive_stats['distinct_easylist_blocked'],
            f"{positive_stats['distinct_easylist_pct']:.2f}"
        ])
        writer.writerow([
            positive_stats['dataset'],
            'easyprivacy',
            f"{positive_stats['easyprivacy_pct']:.2f}",
            positive_stats['easyprivacy_blocked'],
            positive_stats['distinct_easyprivacy_blocked'],
            f"{positive_stats['distinct_easyprivacy_pct']:.2f}"
        ])
        writer.writerow([
            positive_stats['dataset'],
            'custom',
            f"{positive_stats['custom_pct']:.2f}",
            positive_stats['custom_blocked'],
            positive_stats['distinct_custom_blocked'],
            f"{positive_stats['distinct_custom_pct']:.2f}"
        ])
    
    print(f"✓ Summary written to {output_csv}\n")
    
    # Print summary to console
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"\nNegative Validation:")
    print(f"  EasyList:     {negative_stats['easylist_blocked']:,} ({negative_stats['easylist_pct']:.2f}%) | Distinct: {negative_stats['distinct_easylist_blocked']:,} ({negative_stats['distinct_easylist_pct']:.2f}%)")
    print(f"  EasyPrivacy:  {negative_stats['easyprivacy_blocked']:,} ({negative_stats['easyprivacy_pct']:.2f}%) | Distinct: {negative_stats['distinct_easyprivacy_blocked']:,} ({negative_stats['distinct_easyprivacy_pct']:.2f}%)")
    print(f"  Custom:       {negative_stats['custom_blocked']:,} ({negative_stats['custom_pct']:.2f}%) | Distinct: {negative_stats['distinct_custom_blocked']:,} ({negative_stats['distinct_custom_pct']:.2f}%)")
    
    print(f"\nPositive Validation:")
    print(f"  EasyList:     {positive_stats['easylist_blocked']:,} ({positive_stats['easylist_pct']:.2f}%) | Distinct: {positive_stats['distinct_easylist_blocked']:,} ({positive_stats['distinct_easylist_pct']:.2f}%)")
    print(f"  EasyPrivacy:  {positive_stats['easyprivacy_blocked']:,} ({positive_stats['easyprivacy_pct']:.2f}%) | Distinct: {positive_stats['distinct_easyprivacy_blocked']:,} ({positive_stats['distinct_easyprivacy_pct']:.2f}%)")
    print(f"  Custom:       {positive_stats['custom_blocked']:,} ({positive_stats['custom_pct']:.2f}%) | Distinct: {positive_stats['distinct_custom_blocked']:,} ({positive_stats['distinct_custom_pct']:.2f}%)")

if __name__ == "__main__":
    main()
