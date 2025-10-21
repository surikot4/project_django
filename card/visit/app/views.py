from django.shortcuts import render, redirect
from django.http import HttpResponse
import subprocess
import sys
import os

def home(request):
    return render(request, 'home.html')

def portfolio(request):
    return render(request, 'portfolio.html')

def tetris(request):
    return render(request, 'tetris.html')
