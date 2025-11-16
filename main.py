#!/usr/bin/env python3
"""
Main CLI application for data augmentation using Self-Organizing Maps.
"""

import argparse
import numpy as np
from src import DataAugmenter
from src.utils import (
    load_sample_data,
    normalize_data,
    denormalize_data,
    save_data,
    load_data,
    calculate_statistics,
    print_statistics
)


def main():
    parser = argparse.ArgumentParser(
        description='Data Augmentation using Self-Organizing Maps',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate sample data and augment it
  python main.py --mode sample --samples 500 --augment 0.5
  
  # Load data from file and augment
  python main.py --mode file --input data.npy --augment 1.0 --output augmented.npy
  
  # Use different augmentation methods
  python main.py --mode sample --method perturb --augment 0.5
        """
    )
    
    parser.add_argument(
        '--mode',
        type=str,
        choices=['sample', 'file'],
        default='sample',
        help='Data mode: sample (generate) or file (load from file)'
    )
    
    parser.add_argument(
        '--input',
        type=str,
        help='Input .npy file (required for file mode)'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        default='augmented_data.npy',
        help='Output file for augmented data (default: augmented_data.npy)'
    )
    
    parser.add_argument(
        '--samples',
        type=int,
        default=1000,
        help='Number of samples to generate (for sample mode, default: 1000)'
    )
    
    parser.add_argument(
        '--augment',
        type=float,
        default=0.5,
        help='Augmentation factor (ratio of synthetic to original samples, default: 0.5)'
    )
    
    parser.add_argument(
        '--method',
        type=str,
        choices=['interpolate', 'sample_neurons', 'perturb'],
        default='interpolate',
        help='Augmentation method (default: interpolate)'
    )
    
    parser.add_argument(
        '--grid-size',
        type=int,
        nargs=2,
        default=[10, 10],
        metavar=('ROWS', 'COLS'),
        help='SOM grid size (default: 10 10)'
    )
    
    parser.add_argument(
        '--epochs',
        type=int,
        default=100,
        help='Training epochs for SOM (default: 100)'
    )
    
    parser.add_argument(
        '--seed',
        type=int,
        help='Random seed for reproducibility'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Print detailed progress'
    )
    
    args = parser.parse_args()
    
    # Load or generate data
    if args.mode == 'file':
        if not args.input:
            parser.error("--input is required for file mode")
        print(f"Loading data from {args.input}...")
        data = load_data(args.input)
    else:
        print(f"Generating {args.samples} sample data points...")
        data = load_sample_data(args.samples, random_state=args.seed)
    
    # Print original data statistics
    print("\nOriginal Data:")
    stats = calculate_statistics(data)
    print_statistics(stats)
    
    # Normalize data
    print("\nNormalizing data...")
    data_normalized, norm_params = normalize_data(data)
    
    # Create and train augmenter
    print(f"\nTraining SOM with grid size {tuple(args.grid_size)}...")
    augmenter = DataAugmenter(
        grid_size=tuple(args.grid_size),
        random_state=args.seed
    )
    
    augmenter.fit(data_normalized, epochs=args.epochs, verbose=args.verbose)
    print("Training completed!")
    
    # Augment data
    print(f"\nGenerating synthetic samples (factor: {args.augment}, method: {args.method})...")
    n_synthetic = int(len(data) * args.augment)
    print(f"Creating {n_synthetic} synthetic samples...")
    
    synthetic_normalized = augmenter.generate_synthetic_samples(
        n_synthetic,
        method=args.method
    )
    
    # Denormalize synthetic data
    synthetic = denormalize_data(synthetic_normalized, norm_params)
    
    # Combine original and synthetic data
    augmented_data = np.vstack([data, synthetic])
    
    # Print augmented data statistics
    print("\nAugmented Data:")
    stats_augmented = calculate_statistics(augmented_data)
    print_statistics(stats_augmented)
    
    # Save augmented data
    print(f"\nSaving augmented data to {args.output}...")
    save_data(augmented_data, args.output)
    
    print("\nAugmentation completed successfully!")
    print(f"Original samples: {len(data)}")
    print(f"Synthetic samples: {len(synthetic)}")
    print(f"Total samples: {len(augmented_data)}")


if __name__ == '__main__':
    main()
