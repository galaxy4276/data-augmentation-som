#!/usr/bin/env python3
"""
Simple example demonstrating the data augmentation application.
"""

import numpy as np
from src import DataAugmenter, SelfOrganizingMap
from src.utils import load_sample_data, normalize_data, calculate_statistics, print_statistics


def main():
    print("=" * 60)
    print("Data Augmentation using Self-Organizing Maps - Example")
    print("=" * 60)
    
    # Generate sample data
    print("\n1. Generating sample data...")
    data = load_sample_data(n_samples=500, random_state=42)
    print(f"Generated {len(data)} samples with {data.shape[1]} features")
    
    # Show original data statistics
    print("\nOriginal Data Statistics:")
    stats = calculate_statistics(data)
    print_statistics(stats)
    
    # Normalize data
    print("\n2. Normalizing data...")
    data_normalized, norm_params = normalize_data(data)
    print("Data normalized to zero mean and unit variance")
    
    # Create and train augmenter
    print("\n3. Training Self-Organizing Map...")
    augmenter = DataAugmenter(grid_size=(10, 10), random_state=42)
    augmenter.fit(data_normalized, epochs=50, verbose=True)
    print("SOM training completed!")
    
    # Generate synthetic samples using different methods
    print("\n4. Generating synthetic samples...")
    
    methods = ['interpolate', 'sample_neurons', 'perturb']
    for method in methods:
        print(f"\n   Method: {method}")
        synthetic = augmenter.generate_synthetic_samples(
            n_samples=100,
            method=method
        )
        print(f"   Generated {len(synthetic)} synthetic samples")
    
    # Augment the dataset
    print("\n5. Augmenting the dataset...")
    augmented = augmenter.augment(
        data_normalized,
        augmentation_factor=0.5,
        method='interpolate'
    )
    print(f"Augmented dataset size: {len(augmented)} samples")
    print(f"  Original: {len(data)} samples")
    print(f"  Synthetic: {len(augmented) - len(data)} samples")
    
    # Show augmented data statistics (denormalized)
    print("\nAugmented Data Statistics:")
    augmented_denorm = augmented * norm_params['std'] + norm_params['mean']
    stats_aug = calculate_statistics(augmented_denorm)
    print_statistics(stats_aug)
    
    print("\n" + "=" * 60)
    print("Example completed successfully!")
    print("=" * 60)


if __name__ == '__main__':
    main()
