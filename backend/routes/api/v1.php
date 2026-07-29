<?php

use App\Http\Controllers\Api\V1\Auth\AdminAuthController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Scans\AudioScanController;
use App\Http\Controllers\Api\V1\Scans\DocumentScanController;
use App\Http\Controllers\Api\V1\Scans\EmailScanController;
use App\Http\Controllers\Api\V1\Scans\ImageScanController;
use App\Http\Controllers\Api\V1\Scans\ScanController;
use App\Http\Controllers\Api\V1\Scans\VideoScanController;
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

Route::middleware('auth:sanctum')
    ->prefix('document-scans')
    ->as('document-scans.')
    ->group(function () {
        Route::post('/', [DocumentScanController::class, 'store'])->name('store');
        Route::get('/', [DocumentScanController::class, 'index'])->name('index');
        Route::get('/{id}', [DocumentScanController::class, 'show'])->name('show');
        Route::get('/{id}/status', [DocumentScanController::class, 'status'])->name('status');
    });

Route::middleware('auth:sanctum')
    ->prefix('image-scans')
    ->as('image-scans.')
    ->group(function () {
        Route::post('/', [ImageScanController::class, 'store'])->name('store');
        Route::get('/', [ImageScanController::class, 'index'])->name('index');
        Route::get('/{id}', [ImageScanController::class, 'show'])->name('show');
        Route::get('/{id}/status', [ImageScanController::class, 'status'])->name('status');
    });

Route::middleware('auth:sanctum')
    ->prefix('audio-scans')
    ->as('audio-scans.')
    ->group(function () {
        Route::post('/', [AudioScanController::class, 'store'])->name('store');
        Route::get('/', [AudioScanController::class, 'index'])->name('index');
        Route::get('/{id}', [AudioScanController::class, 'show'])->name('show');
        Route::get('/{id}/status', [AudioScanController::class, 'status'])->name('status');
    });

Route::middleware('auth:sanctum')
    ->prefix('video-scans')
    ->as('video-scans.')
    ->group(function () {
        Route::post('/', [VideoScanController::class, 'store'])->name('store');
        Route::get('/', [VideoScanController::class, 'index'])->name('index');
        Route::get('/{id}', [VideoScanController::class, 'show'])->name('show');
        Route::get('/{id}/status', [VideoScanController::class, 'status'])->name('status');
    });
