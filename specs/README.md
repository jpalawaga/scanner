# Scanner Project Specification

This directory describes the current Scanner product specification from the shipped application. It is organized for reimplementation work: start with architecture, then read the screen specs, then use the feature and component docs for cross-cutting behavior.

## Table of Contents

### Architecture
- [App Overview](architecture/overview.md)
- [Data and State](architecture/data-and-state.md)

### Screens
- [Home](screens/home.md)
- [Scan QR Code](screens/scan.md)
- [Add Interaction](screens/add-interaction.md)

### Features
- [Log Interactions](features/log-interactions.md)
- [PWA, Offline, and Platform Behavior](features/pwa-offline-and-platform.md)

### Components
- [Common UI Components](components/common-ui.md)
- [Log and Library Components](components/log-and-library-components.md)

## System Summary

- Scanner is a mobile-first local utility for tracking interactions at conferences and similar events.
- Scanner ships a Home -> QR scan -> Add Interaction flow for recording event conversations from badge QR codes.
- Saved interactions persist in browser `localStorage` and are available offline in the same browser profile.
- Scanner is intended for a single person organizing event leads.

## Reading Order

1. Read [App Overview](architecture/overview.md) for routes, shell responsibilities, and product boundaries.
2. Read the relevant screen docs for UI and flow details.
3. Use the feature docs for shared algorithms such as suggestions, crash recovery, backup, and offline behavior.
4. Use the component docs when rebuilding the UI layer.
