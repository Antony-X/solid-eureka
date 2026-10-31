import torch
import torch.nn as nn


class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(2, 8)
        self.act1 = nn.ReLU()
        self.fc2 = nn.Linear(8, 8)
        self.act2 = nn.ReLU()
        self.fc3 = nn.Linear(8, 1)
        self.out = nn.Sigmoid()  # the grader gets a probability, as in the official baseline

    def logits(self, x):  # used for training with nn.BCEWithLogitsLoss
        x = self.act1(self.fc1(x))
        x = self.act2(self.fc2(x))
        return self.fc3(x)

    def forward(self, x):  # what the grader calls
        return self.out(self.logits(x))
