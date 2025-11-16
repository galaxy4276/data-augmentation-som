"""
Data augmentation utilities using Self-Organizing Maps.
"""

import numpy as np
from typing import Optional, Tuple
from .som import SelfOrganizingMap


class DataAugmenter:
    """
    Data augmentation using Self-Organizing Maps.
    
    This class uses a trained SOM to generate synthetic data points
    by interpolating between learned prototypes.
    """
    
    def __init__(
        self,
        grid_size: Tuple[int, int] = (10, 10),
        random_state: Optional[int] = None
    ):
        """
        Initialize the data augmenter.
        
        Args:
            grid_size: Size of the SOM grid
            random_state: Random seed for reproducibility
        """
        self.som = SelfOrganizingMap(
            grid_size=grid_size,
            random_state=random_state
        )
        self.random_state = random_state
        if random_state is not None:
            np.random.seed(random_state)
    
    def fit(self, X: np.ndarray, epochs: int = 100, verbose: bool = False):
        """
        Train the augmenter on the input data.
        
        Args:
            X: Training data of shape (n_samples, n_features)
            epochs: Number of training epochs
            verbose: Whether to print progress
        """
        self.som.fit(X, epochs=epochs, verbose=verbose)
        self.original_data = X.copy()
    
    def generate_synthetic_samples(
        self,
        n_samples: int,
        method: str = 'interpolate'
    ) -> np.ndarray:
        """
        Generate synthetic data samples.
        
        Args:
            n_samples: Number of samples to generate
            method: Generation method ('interpolate', 'sample_neurons', 'perturb')
            
        Returns:
            Synthetic data samples of shape (n_samples, n_features)
        """
        if not self.som.trained:
            raise ValueError("Augmenter must be trained before generating samples")
        
        if method == 'interpolate':
            return self._interpolate_samples(n_samples)
        elif method == 'sample_neurons':
            return self._sample_from_neurons(n_samples)
        elif method == 'perturb':
            return self._perturb_samples(n_samples)
        else:
            raise ValueError(f"Unknown method: {method}")
    
    def _interpolate_samples(self, n_samples: int) -> np.ndarray:
        """
        Generate samples by interpolating between neighboring neurons.
        """
        weights = self.som.get_weights()
        rows, cols, dim = weights.shape
        
        synthetic = []
        for _ in range(n_samples):
            # Randomly select two neighboring neurons
            row = np.random.randint(0, rows - 1)
            col = np.random.randint(0, cols - 1)
            
            # Choose a random neighbor
            neighbors = [(0, 1), (1, 0), (1, 1)]
            dr, dc = neighbors[np.random.randint(len(neighbors))]
            
            if row + dr < rows and col + dc < cols:
                # Interpolate between the two neurons
                alpha = np.random.random()
                neuron1 = weights[row, col]
                neuron2 = weights[row + dr, col + dc]
                sample = alpha * neuron1 + (1 - alpha) * neuron2
                synthetic.append(sample)
        
        return np.array(synthetic)
    
    def _sample_from_neurons(self, n_samples: int) -> np.ndarray:
        """
        Generate samples by randomly selecting neurons with Gaussian noise.
        """
        weights = self.som.get_weights()
        rows, cols, dim = weights.shape
        
        synthetic = []
        for _ in range(n_samples):
            row = np.random.randint(0, rows)
            col = np.random.randint(0, cols)
            
            # Add small Gaussian noise
            noise = np.random.randn(dim) * 0.1
            sample = weights[row, col] + noise
            synthetic.append(sample)
        
        return np.array(synthetic)
    
    def _perturb_samples(self, n_samples: int) -> np.ndarray:
        """
        Generate samples by perturbing original data points.
        """
        indices = np.random.choice(
            len(self.original_data),
            size=n_samples,
            replace=True
        )
        
        synthetic = []
        for idx in indices:
            # Get the original sample
            sample = self.original_data[idx].copy()
            
            # Find its BMU
            bmu_idx = self.som._find_bmu(sample)
            
            # Get nearby neurons
            row, col = bmu_idx
            rows, cols = self.som.grid_size
            
            neighbors = []
            for dr in [-1, 0, 1]:
                for dc in [-1, 0, 1]:
                    new_row, new_col = row + dr, col + dc
                    if 0 <= new_row < rows and 0 <= new_col < cols:
                        neighbors.append(self.som.weights[new_row, new_col])
            
            # Mix original sample with neighbor information
            if neighbors:
                neighbor = neighbors[np.random.randint(len(neighbors))]
                alpha = np.random.uniform(0.7, 0.9)  # Bias towards original
                sample = alpha * sample + (1 - alpha) * neighbor
            
            synthetic.append(sample)
        
        return np.array(synthetic)
    
    def augment(
        self,
        X: np.ndarray,
        augmentation_factor: float = 0.5,
        method: str = 'interpolate'
    ) -> np.ndarray:
        """
        Augment the dataset by adding synthetic samples.
        
        Args:
            X: Original data
            augmentation_factor: Ratio of synthetic to original samples
            method: Generation method
            
        Returns:
            Augmented dataset containing original and synthetic samples
        """
        n_synthetic = int(len(X) * augmentation_factor)
        synthetic = self.generate_synthetic_samples(n_synthetic, method=method)
        
        # Combine original and synthetic data
        augmented = np.vstack([X, synthetic])
        
        return augmented
