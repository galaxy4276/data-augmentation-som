"""
Self-Organizing Map (SOM) implementation for data analysis and augmentation.
"""

import numpy as np
from typing import Tuple, Optional


class SelfOrganizingMap:
    """
    Self-Organizing Map (Kohonen Network) for unsupervised learning.
    
    This implementation can be used to learn data topology and generate
    synthetic data points for augmentation.
    """
    
    def __init__(
        self,
        grid_size: Tuple[int, int] = (10, 10),
        input_dim: Optional[int] = None,
        learning_rate: float = 0.5,
        sigma: float = 1.0,
        random_state: Optional[int] = None
    ):
        """
        Initialize the Self-Organizing Map.
        
        Args:
            grid_size: Tuple of (rows, cols) for the SOM grid
            input_dim: Number of input features (set during fit if None)
            learning_rate: Initial learning rate
            sigma: Initial neighborhood radius
            random_state: Random seed for reproducibility
        """
        self.grid_size = grid_size
        self.input_dim = input_dim
        self.learning_rate_init = learning_rate
        self.sigma_init = sigma
        self.random_state = random_state
        
        if random_state is not None:
            np.random.seed(random_state)
        
        self.weights = None
        self.trained = False
        
    def _initialize_weights(self, input_dim: int):
        """Initialize the weight matrix randomly."""
        self.input_dim = input_dim
        rows, cols = self.grid_size
        self.weights = np.random.randn(rows, cols, input_dim) * 0.1
        
    def _get_neighborhood(self, bmu_idx: Tuple[int, int], iteration: int, max_iter: int) -> np.ndarray:
        """
        Calculate the neighborhood influence for all neurons.
        
        Args:
            bmu_idx: Best Matching Unit indices (row, col)
            iteration: Current iteration number
            max_iter: Maximum number of iterations
            
        Returns:
            Array of neighborhood influences
        """
        rows, cols = self.grid_size
        sigma = self.sigma_init * np.exp(-iteration / max_iter)
        
        # Create grid of distances from BMU
        row_indices, col_indices = np.meshgrid(range(rows), range(cols), indexing='ij')
        distances = (row_indices - bmu_idx[0])**2 + (col_indices - bmu_idx[1])**2
        
        # Calculate Gaussian neighborhood function
        neighborhood = np.exp(-distances / (2 * sigma**2))
        return neighborhood[:, :, np.newaxis]
    
    def _find_bmu(self, sample: np.ndarray) -> Tuple[int, int]:
        """
        Find the Best Matching Unit for a given sample.
        
        Args:
            sample: Input sample
            
        Returns:
            Indices (row, col) of the BMU
        """
        # Calculate Euclidean distances to all neurons
        distances = np.sum((self.weights - sample)**2, axis=2)
        bmu_idx = np.unravel_index(np.argmin(distances), self.grid_size)
        return bmu_idx
    
    def fit(self, X: np.ndarray, epochs: int = 100, verbose: bool = False):
        """
        Train the SOM on the input data.
        
        Args:
            X: Training data of shape (n_samples, n_features)
            epochs: Number of training epochs
            verbose: Whether to print training progress
        """
        if self.weights is None:
            self._initialize_weights(X.shape[1])
        
        n_samples = X.shape[0]
        max_iter = epochs * n_samples
        
        for epoch in range(epochs):
            # Shuffle data each epoch
            indices = np.random.permutation(n_samples)
            
            for i, idx in enumerate(indices):
                iteration = epoch * n_samples + i
                sample = X[idx]
                
                # Find BMU
                bmu_idx = self._find_bmu(sample)
                
                # Update learning rate
                lr = self.learning_rate_init * np.exp(-iteration / max_iter)
                
                # Get neighborhood function
                neighborhood = self._get_neighborhood(bmu_idx, iteration, max_iter)
                
                # Update weights
                self.weights += lr * neighborhood * (sample - self.weights)
            
            if verbose and (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch + 1}/{epochs} completed")
        
        self.trained = True
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Map input samples to SOM grid positions.
        
        Args:
            X: Input data of shape (n_samples, n_features)
            
        Returns:
            Array of BMU indices for each sample
        """
        if not self.trained:
            raise ValueError("SOM must be trained before prediction")
        
        bmus = np.array([self._find_bmu(sample) for sample in X])
        return bmus
    
    def get_weights(self) -> np.ndarray:
        """
        Get the trained weight matrix.
        
        Returns:
            Weight matrix of shape (rows, cols, input_dim)
        """
        return self.weights.copy()
    
    def reconstruct(self, bmu_indices: np.ndarray) -> np.ndarray:
        """
        Reconstruct data points from BMU indices.
        
        Args:
            bmu_indices: Array of BMU indices of shape (n_samples, 2)
            
        Returns:
            Reconstructed data points
        """
        reconstructed = np.array([
            self.weights[idx[0], idx[1]] for idx in bmu_indices
        ])
        return reconstructed
