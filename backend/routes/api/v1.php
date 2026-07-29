<?php

use App\Http\Controllers\Api\V1\Auth\AdminAuthController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Scans\EmailScanController;
use App\Http\Controllers\Api\V1\Scans\ScanController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class)->name('health');

Route::prefix('auth')
    ->as('auth.')
    ->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('register');
        Route::post('/login', [AuthController::class, 'login'])->name('login');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::get('/me', [AuthController::class, 'me'])->name('me');
        });
    });

Route::prefix('admin/auth')
    ->as('admin.auth.')
    ->group(function () {
        Route::post('/login', [AdminAuthController::class, 'login'])->name('login');

        Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
            Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
            Route::get('/me', [AdminAuthController::class, 'me'])->name('me');
        });
    });

Route::middleware('auth:sanctum')
    ->prefix('scans')
    ->as('scans.')
    ->group(function () {
        Route::post('/', [ScanController::class, 'store'])->name('store');
        Route::get('/', [ScanController::class, 'index'])->name('index');
        Route::get('/{id}', [ScanController::class, 'show'])->name('show');
        Route::get('/{id}/status', [ScanController::class, 'status'])->name('status');
    });

Route::middleware('auth:sanctum')
    ->prefix('email-scans')
    ->as('email-scans.')
    ->group(function () {
        Route::post('/', [EmailScanController::class, 'store'])->name('store');
        Route::get('/', [EmailScanController::class, 'index'])->name('index');
        Route::get('/{id}', [EmailScanController::class, 'show'])->name('show');
        Route::get('/{id}/status', [EmailScanController::class, 'status'])->name('status');
    });
