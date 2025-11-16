"""
Utility functions for data processing and visualization.
"""

import numpy as np
from typing import Optional, Tuple


def normalize_data(X: np.ndarray) -> Tuple[np.ndarray, dict]:
    """
    Normalize data to zero mean and unit variance.
    
    Args:
        X: Input data of shape (n_samples, n_features)
        
    Returns:
        Tuple of (normalized_data, normalization_params)
    """
    mean = np.mean(X, axis=0)
    std = np.std(X, axis=0)
    std[std == 0] = 1  # Avoid division by zero
    
    X_normalized = (X - mean) / std
    
    params = {'mean': mean, 'std': std}
    return X_normalized, params


def denormalize_data(X: np.ndarray, params: dict) -> np.ndarray:
    """
    Denormalize data back to original scale.
    
    Args:
        X: Normalized data
        params: Dictionary with 'mean' and 'std'
        
    Returns:
        Denormalized data
    """
    return X * params['std'] + params['mean']


def load_sample_data(n_samples: int = 1000, random_state: Optional[int] = None) -> np.ndarray:
    """
    Generate sample 2D data for testing (two clusters).
    
    Args:
        n_samples: Number of samples to generate
        random_state: Random seed
        
    Returns:
        Sample data of shape (n_samples, 2)
    """
    if random_state is not None:
        np.random.seed(random_state)
    
    # Generate two clusters
    cluster1 = np.random.randn(n_samples // 2, 2) * 0.5 + np.array([2, 2])
    cluster2 = np.random.randn(n_samples // 2, 2) * 0.5 + np.array([-2, -2])
    
    data = np.vstack([cluster1, cluster2])
    np.random.shuffle(data)
    
    return data


def save_data(data: np.ndarray, filename: str):
    """
    Save data to a file.
    
    Args:
        data: Data to save
        filename: Output filename
    """
    np.save(filename, data)
    print(f"Data saved to {filename}")


def load_data(filename: str) -> np.ndarray:
    """
    Load data from a file.
    
    Args:
        filename: Input filename
        
    Returns:
        Loaded data
    """
    data = np.load(filename)
    print(f"Data loaded from {filename}")
    return data


def calculate_statistics(data: np.ndarray) -> dict:
    """
    Calculate basic statistics of the data.
    
    Args:
        data: Input data
        
    Returns:
        Dictionary with statistics
    """
    stats = {
        'n_samples': data.shape[0],
        'n_features': data.shape[1] if data.ndim > 1 else 1,
        'mean': np.mean(data, axis=0),
        'std': np.std(data, axis=0),
        'min': np.min(data, axis=0),
        'max': np.max(data, axis=0)
    }
    return stats


def print_statistics(stats: dict):
    """
    Print data statistics in a formatted way.
    
    Args:
        stats: Statistics dictionary
    """
    print("Data Statistics:")
    print(f"  Samples: {stats['n_samples']}")
    print(f"  Features: {stats['n_features']}")
    print(f"  Mean: {stats['mean']}")
    print(f"  Std: {stats['std']}")
    print(f"  Min: {stats['min']}")
    print(f"  Max: {stats['max']}")
