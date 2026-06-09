#!/usr/bin/env python3
"""
Evaluate adblocker rules against URLs in the evaluation dataset.

Loads rules generated from FP-Growth patterns and tests them against
URLs, adding a blocked_fpg column to indicate if the URL matches any rule.
"""

import pandas as pd
import os
from adblockparser import AdblockRules


def load_rules(rules_file: str) -> AdblockRules:
    """
    Load and parse adblocker rules from a file.
    
    Args:
        rules_file: Path to rules file (one rule per line)
        
    Returns:
        AdblockRules object for matching URLs
    """
    if not os.path.exists(rules_file):
        raise FileNotFoundError(f"Rules file not found: {rules_file}")
    
    print(f"Loading rules from {rules_file}...")
    
    with open(rules_file, 'r') as f:
        raw_rules = [line.strip() for line in f if line.strip()]
    
    print(f"  Loaded {len(raw_rules):,} rules")
    
    # Parse rules with adblockparser
    rules = AdblockRules(raw_rules)
    
    return rules


def evaluate_urls(evaluation_csv: str, rules: AdblockRules, output_csv: str):
    """
    Evaluate URLs against adblocker rules and add blocked_fpg column.
    
    Args:
        evaluation_csv: Path to evaluation CSV with URLs
        rules: AdblockRules object for matching
        output_csv: Path to output CSV with blocked_fpg column added
    """
    print(f"\nLoading evaluation URLs from {evaluation_csv}...")
    
    # Read CSV in chunks for large files
    chunk_size = 10000
    first_chunk = True
    total_processed = 0
    total_blocked = 0
    
    chunk_iter = pd.read_csv(evaluation_csv, chunksize=chunk_size, low_memory=False)
    
    for chunk_num, chunk in enumerate(chunk_iter, 1):
        if 'url' not in chunk.columns:
            raise ValueError(f"Column 'url' not found in {evaluation_csv}")
        
        # Test each URL against rules
        chunk['blocked_fpg'] = chunk['url'].apply(lambda url: rules.should_block(url))
        
        # Count blocked URLs in this chunk
        blocked_count = chunk['blocked_fpg'].sum()
        total_blocked += blocked_count
        total_processed += len(chunk)
        
        # Write chunk to output file
        if first_chunk:
            chunk.to_csv(output_csv, index=False)
            first_chunk = False
        else:
            chunk.to_csv(output_csv, mode='a', header=False, index=False)
        
        # Progress update
        if chunk_num % 10 == 0:
            print(f"  Processed {total_processed:,} URLs ({chunk_num} chunks), "
                  f"{total_blocked:,} blocked ({100*total_blocked/total_processed:.2f}%)")
    
    print(f"\nEvaluation complete:")
    print(f"  - Total URLs processed: {total_processed:,}")
    print(f"  - URLs blocked: {total_blocked:,} ({100*total_blocked/total_processed:.2f}%)")
    print(f"  - Results saved to {output_csv}")


def main():
    """Main function to evaluate rules for the 794-key experiment only."""
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    evaluation_csv = os.path.join(base_dir, 'evaluation', 'set1_classified.csv')
    
    if not os.path.exists(evaluation_csv):
        raise FileNotFoundError(f"Evaluation CSV not found: {evaluation_csv}")
    
    # Evaluate 794-keys full experiment
    rules_794 = os.path.join(base_dir, 'evaluation', 'rules_keys794.txt')
    output_794 = os.path.join(base_dir, 'evaluation', 'set1_classified_keys794.csv')

    if os.path.exists(rules_794):
        print("\n" + "=" * 60)
        print("Evaluating keys794 rules")
        print("=" * 60)
        rules = load_rules(rules_794)
        evaluate_urls(evaluation_csv, rules, output_794)
    else:
        print(f"Warning: Rules file not found: {rules_794}")
        print("  Run create_rules.py first to generate rules")


if __name__ == '__main__':
    main()

