#!/usr/bin/env python3
"""
High-level orchestration script for running multiple experiments with different parameters.
Runs feature extraction and FP-Growth pattern mining with various configurations.
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Any
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Import from our modules
from analyze_query_keys import process_url_experiment
from fpgrowth_pipeline import run_pipeline

# Thread lock for print statements to avoid interleaving
print_lock = threading.Lock()


def safe_print(*args, **kwargs):
    """Thread-safe print function."""
    with print_lock:
        print(*args, **kwargs)


def print_experiment_header(exp_num: int, exp_name: str):
    """Print a formatted header for an experiment."""
    safe_print("\n" + "="*80)
    safe_print(f"EXPERIMENT {exp_num}: {exp_name}")
    safe_print("="*80 + "\n")


def run_single_experiment(
    exp_name: str,
    top_k: int,
    key_source: str,
    max_depth: int,
    support_thresholds: List[float],
    force_feature_extraction: bool = False
):
    """
    Run a complete experiment: feature extraction + FP-Growth mining.
    
    Args:
        exp_name: Name/description of the experiment
        top_k: Number of top keys to extract as features
        key_source: Which dataset to use for key selection ('positive', 'negative', 'both')
        max_depth: Maximum depth for FP-Growth itemsets
        support_thresholds: List of minimum support thresholds to test
        force_feature_extraction: If True, re-generate feature files even if they exist
    
    Returns:
        Tuple of (experiment_name, success: bool, error_message: str, elapsed_time: float)
    """
    start_time = time.time()
    error_msg = None
    
    try:
        safe_print(f"\n{'='*80}")
        safe_print(f"[{exp_name}] Running Experiment: {exp_name}")
        safe_print(f"[{exp_name}] {'='*80}")
        safe_print(f"[{exp_name}]   Top K: {top_k}")
        safe_print(f"[{exp_name}]   Key Source: {key_source}")
        safe_print(f"[{exp_name}]   Max Depth: {max_depth}")
        safe_print(f"[{exp_name}]   Support Thresholds: {support_thresholds}")
        safe_print(f"[{exp_name}] {'='*80}\n")
        
        # Configuration
        data_dir = "data_small" #"data"
        features_dir = "features_data_small" #"features_data"
        
        # Step 1: Feature extraction
        safe_print(f"[{exp_name}] {'─'*80}")
        safe_print(f"[{exp_name}] STEP 1: FEATURE EXTRACTION")
        safe_print(f"[{exp_name}] {'─'*80}")
        
        process_url_experiment(
            data_dir=data_dir,
            output_dir=features_dir,
            top_k=top_k,
            key_source=key_source,
            force=force_feature_extraction
        )
        
        # Step 2: FP-Growth mining
        safe_print(f"[{exp_name}] {'─'*80}")
        safe_print(f"[{exp_name}] STEP 2: FP-GROWTH PATTERN MINING")
        safe_print(f"[{exp_name}] {'─'*80}")
        
        positive_csv = os.path.join(features_dir, f"positive_train_with_query_keys_{key_source}_{top_k}.csv")
        negative_csv = os.path.join(features_dir, f"negative_train_with_query_keys_{key_source}_{top_k}.csv")
        
        if not os.path.exists(positive_csv):
            error_msg = f"Feature file not found: {positive_csv}"
            safe_print(f"[{exp_name}] Error: {error_msg}")
            return (exp_name, False, error_msg, time.time() - start_time)
        
        if not os.path.exists(negative_csv):
            error_msg = f"Feature file not found: {negative_csv}"
            safe_print(f"[{exp_name}] Error: {error_msg}")
            return (exp_name, False, error_msg, time.time() - start_time)
        
        # Create output directory with experiment-specific name
        output_dir = f"outputs_exp_{exp_name}"
        
        run_pipeline(
            positive_csv=positive_csv,
            negative_csv=negative_csv,
            output_dir=output_dir,
            support_thresholds=support_thresholds,
            top_k=50,  # This is for plotting, not feature selection
            max_depth=max_depth,
        )
        
        elapsed_time = time.time() - start_time
        safe_print(f"[{exp_name}] {'─'*80}")
        safe_print(f"[{exp_name}] Experiment '{exp_name}' completed in {elapsed_time:.1f} seconds")
        safe_print(f"[{exp_name}] {'─'*80}")
        
        safe_print(f"[{exp_name}] Generated output directory: {output_dir}/")
        safe_print(f"[{exp_name}] Feature files: {features_dir}/")
        safe_print(f"[{exp_name}]   - positive_train_with_query_keys_{key_source}_{top_k}.csv")
        safe_print(f"[{exp_name}]   - negative_train_with_query_keys_{key_source}_{top_k}.csv")
        
        return (exp_name, True, None, elapsed_time)
        
    except Exception as e:
        elapsed_time = time.time() - start_time
        error_msg = str(e)
        safe_print(f"[{exp_name}] ❌ ERROR in experiment '{exp_name}':")
        safe_print(f"[{exp_name}]    {error_msg}")
        return (exp_name, False, error_msg, elapsed_time)


def main():
    """Main function to run all experiments."""
    safe_print("\n" + "="*80)
    safe_print("HIGH-LEVEL EXPERIMENT ORCHESTRATION (PARALLEL)")
    safe_print("="*80)
    safe_print("\nThis script will run multiple experiments in PARALLEL with different configurations.")
    safe_print("Each experiment consists of:")
    safe_print("  1. Feature extraction (query key selection and augmentation)")
    safe_print("  2. FP-Growth pattern mining with statistical analysis")
    safe_print("\n" + "="*80)
    
    experiments = []
    
    # 100 keys experiments
    # Experiment 1: 100 keys, both, no min_sup, depth 3
    #experiments.append({
    #    'name': 'keys100_both_nominsup_depth3',
    #    'top_k': 100,
    #    'key_source': 'both',
    #    'max_depth': 3,
    #    'support_thresholds': [0.0001]  # Very low threshold to approximate "no min_support"
    #})
    
    # Experiment 2: 100 keys, both, with min_sup, depth 3
    #experiments.append({
    #    'name': 'keys100_both_minsup_depth3',
    #    'top_k': 100,
    #    'key_source': 'both',
    #    'max_depth': 3,
    #    'support_thresholds': [0.001]
    #})
    
    # Experiment 3: 100 keys, positive, no min_sup, depth 3
    #experiments.append({
    #    'name': 'keys100_positive_nominsup_depth3',
    #    'top_k': 100,
    #    'key_source': 'positive',
    #    'max_depth': 3,
    #    'support_thresholds': [0.0001]  # Very low threshold to approximate "no min_support"
    #})
    
    # Experiment 4: 100 keys, positive, with min_sup, depth 3
    #experiments.append({
    #    'name': 'keys100_positive_minsup_depth3',
    #    'top_k': 100,
    #    'key_source': 'positive',
    #    'max_depth': 3,
    #    'support_thresholds': [0.001]
    #})
    
    # 929 keys experiments
    # Experiment 5: 929 keys, both, no min_sup, depth 3
    #experiments.append({
    #    'name': 'keys929_both_nominsup_depth3',
    #    'top_k': 929,
    #    'key_source': 'both',
    #    'max_depth': 3,
    #    'support_thresholds': [0.0001]  # Very low threshold to approximate "no min_support"
    #})
    
    # Experiment 6: 929 keys, both, with min_sup, depth 3
    #experiments.append({
    #    'name': 'keys929_both_minsup_depth3',
    #    'top_k': 929,
    #    'key_source': 'both',
    #    'max_depth': 3,
    #    'support_thresholds': [0.001]
    #})
    
    # Experiment 7: 929 keys, positive, no min_sup, depth 3
    #experiments.append({
    #    'name': 'keys929_positive_nominsup_depth3',
    #    'top_k': 929,
    #    'key_source': 'positive',
    #    'max_depth': 3,
    #    'support_thresholds': [0.0001]  # Very low threshold to approximate "no min_support"
    #})
    
    # Experiment 8: 794 keys, positive, with min_sup, depth 3
    #experiments.append({
    #    'name': 'keys794_positive_minsup_depth3',
    #    'top_k': 794,
    #    'key_source': 'positive',
    #    'max_depth': 3,
    #    'support_thresholds': [0.001]
    #})


    experiments.append({
        'name': 'keys161_positive_minsup_depth3_small',
        'top_k': 161,
        'key_source': 'positive',
        'max_depth': 3,
        'support_thresholds': [0.001]
    })


    
    safe_print(f"\nTotal experiments to run: {len(experiments)}\n")
    for i, exp in enumerate(experiments, 1):
        safe_print(f"  {i}. {exp['name']}")
        safe_print(f"     - Top K: {exp['top_k']}, Key Source: {exp['key_source']}")
        safe_print(f"     - Max Depth: {exp['max_depth']}, Support Thresholds: {exp['support_thresholds']}")
    safe_print()
    
    # Ask for confirmation
    response = input("Proceed with all experiments in PARALLEL? (yes/no): ").strip().lower()
    if response not in ['yes', 'y']:
        safe_print("Experiments cancelled.")
        return
    
    safe_print("\n" + "="*80)
    safe_print("STARTING EXPERIMENTS IN PARALLEL")
    safe_print("="*80)
    
    total_start_time = time.time()
    
    # Run experiments in parallel (reduced to 1-2 to prevent OOM with large datasets)
    # Each experiment loads ~15-16GB of data, so limit parallelism to avoid memory exhaustion
    num_workers = min(2, len(experiments))  # Reduced from 4 to 2 to prevent OOM
    safe_print(f"\nUsing {num_workers} parallel workers (reduced to prevent memory issues)...\n")
    
    results = []
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        # Submit all experiments
        future_to_exp = {
            executor.submit(
                run_single_experiment,
                exp_name=exp_config['name'],
                top_k=exp_config['top_k'],
                key_source=exp_config['key_source'],
                max_depth=exp_config['max_depth'],
                support_thresholds=exp_config['support_thresholds'],
                force_feature_extraction=False  # Don't force, let file existence checks handle it
            ): exp_config for exp_config in experiments
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_exp):
            result = future.result()
            results.append(result)
            exp_name, success, error_msg, elapsed_time = result
            
            if success:
                safe_print(f"\n✓ Experiment '{exp_name}' completed successfully in {elapsed_time:.1f} seconds\n")
            else:
                safe_print(f"\n✗ Experiment '{exp_name}' failed: {error_msg}\n")
    
    total_elapsed_time = time.time() - total_start_time
    
    # Sort results by experiment name for consistent reporting
    results.sort(key=lambda x: x[0])
    
    safe_print("\n" + "="*80)
    safe_print("ALL EXPERIMENTS COMPLETED")
    safe_print("="*80)
    safe_print(f"\nTotal time: {total_elapsed_time/60:.1f} minutes")
    
    # Print results summary
    safe_print(f"\n{'─'*80}")
    safe_print("RESULTS SUMMARY")
    safe_print(f"{'─'*80}")
    
    successful = [r for r in results if r[1]]
    failed = [r for r in results if not r[1]]
    
    safe_print(f"\nSuccessfully completed: {len(successful)}/{len(results)}")
    for exp_name, success, error_msg, elapsed_time in successful:
        safe_print(f"  ✓ {exp_name}: {elapsed_time/60:.1f} minutes")
    
    if failed:
        safe_print(f"\nFailed: {len(failed)}/{len(results)}")
        for exp_name, success, error_msg, elapsed_time in failed:
            safe_print(f"  ✗ {exp_name}: {error_msg}")
    
    safe_print(f"\n{'─'*80}")
    safe_print("OUTPUT DIRECTORIES")
    safe_print(f"{'─'*80}")
    

    for exp_config in experiments:
        output_dir = f"outputs_exp_{exp_config['name']}"
        if os.path.exists(output_dir):
            safe_print(f"  ✓ {output_dir}/")
        else:
            safe_print(f"  ✗ {output_dir}/ (not found)")
    
    safe_print(f"\nFeature data directory: features_data/")
    safe_print("\nExperiment Summary:")
    for exp_config in experiments:
        safe_print(f"  - {exp_config['name']}: top_k={exp_config['top_k']}, "
                   f"depth={exp_config['max_depth']}, "
                   f"support={exp_config['support_thresholds']}")


if __name__ == "__main__":
    main()
