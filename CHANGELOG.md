# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [8.1.0](https://github.com/MapColonies/mc-priority-queue/compare/v8.0.1...v8.1.0) (2024-07-14)


### Features

* support jobs/find route in jobManager (MAPCO-4427 , MAPCO-4431) ([#38](https://github.com/MapColonies/mc-priority-queue/issues/38)) ([2e0bbb9](https://github.com/MapColonies/mc-priority-queue/commit/2e0bbb94b29212dccf80456d9029185feeaec56d))


### Bug Fixes

* unsent params ([#39](https://github.com/MapColonies/mc-priority-queue/issues/39)) ([559e311](https://github.com/MapColonies/mc-priority-queue/commit/559e31101c502049ee3750b1f50274f803e8974c))

### [8.0.1](https://github.com/MapColonies/mc-priority-queue/compare/v8.0.0...v8.0.1) (2024-07-14)

## [8.0.0](https://github.com/MapColonies/mc-priority-queue/compare/v7.1.1...v8.0.0) (2024-06-05)

### [7.1.1](https://github.com/MapColonies/mc-priority-queue/compare/v7.1.0...v7.1.1) (2024-02-05)

## [7.1.0](https://github.com/MapColonies/mc-priority-queue/compare/v7.0.2...v7.1.0) (2023-09-12)


### Features

* allowing multiple intervals ([#35](https://github.com/MapColonies/mc-priority-queue/issues/35)) ([69640ce](https://github.com/MapColonies/mc-priority-queue/commit/69640ce4fcb741b47ca3ac497e26e21b3f2c5197))

### [7.0.2](https://github.com/MapColonies/mc-priority-queue/compare/v7.0.1...v7.0.2) (2023-09-07)


### Bug Fixes

* not removing row from heartbeat db ([#34](https://github.com/MapColonies/mc-priority-queue/issues/34)) ([17b2bb6](https://github.com/MapColonies/mc-priority-queue/commit/17b2bb61d4dbc0bb7353eee1e8628b99c7275f74))

### [7.0.1](https://github.com/MapColonies/mc-priority-queue/compare/v7.0.0...v7.0.1) (2023-05-29)

## [7.0.0](https://github.com/MapColonies/mc-priority-queue/compare/v6.1.1...v7.0.0) (2023-05-29)


### ⚠ BREAKING CHANGES

* remove job type from ctor (MAPCO-3145) (#33)

* remove job type from ctor (MAPCO-3145) ([#33](https://github.com/MapColonies/mc-priority-queue/issues/33)) ([a032a4a](https://github.com/MapColonies/mc-priority-queue/commit/a032a4a1442bc6201d88b592d2471a8fa66a6dbb))

### [6.1.1](https://github.com/MapColonies/mc-priority-queue/compare/v6.1.0...v6.1.1) (2023-05-04)


### Bug Fixes

* async send interval operation ([#31](https://github.com/MapColonies/mc-priority-queue/issues/31)) ([fc21435](https://github.com/MapColonies/mc-priority-queue/commit/fc21435b117a950de703dc092f708c79e5132ae2))

## [6.1.0](https://github.com/MapColonies/mc-priority-queue/compare/v6.0.0...v6.1.0) (2023-04-30)


### Features

* create task for job ([#30](https://github.com/MapColonies/mc-priority-queue/issues/30)) ([969c30f](https://github.com/MapColonies/mc-priority-queue/commit/969c30f7fce57c3708732d291c2c5b3cd8aad63c))

## [6.0.0](https://github.com/MapColonies/mc-priority-queue/compare/v5.0.1...v6.0.0) (2023-04-25)


### ⚠ BREAKING CHANGES

* update major dependecies according to ts boilerplate (#28)

* update major dependecies according to ts boilerplate ([#28](https://github.com/MapColonies/mc-priority-queue/issues/28)) ([e7fc374](https://github.com/MapColonies/mc-priority-queue/commit/e7fc374f7b3aef63cd0336b369eee451fbc7d68f))

### [5.0.1](https://github.com/MapColonies/mc-priority-queue/compare/v5.0.0...v5.0.1) (2023-03-29)


### Bug Fixes

* throws error instead of returning undefined (MAPCO-2988) ([#26](https://github.com/MapColonies/mc-priority-queue/issues/26)) ([0a59fb1](https://github.com/MapColonies/mc-priority-queue/commit/0a59fb11df68fea933d79ff8d70a0f991abc1ece))

## [5.0.0](https://github.com/MapColonies/mc-priority-queue/compare/v4.1.0...v5.0.0) (2023-03-13)


### ⚠ BREAKING CHANGES

* update API and logs (#24)

### Features

* update API and logs ([#24](https://github.com/MapColonies/mc-priority-queue/issues/24)) ([f856331](https://github.com/MapColonies/mc-priority-queue/commit/f856331f04a75cc3b88bd8c5242e2222367a1852))

## [4.1.0](https://github.com/MapColonies/mc-priority-queue/compare/v3.1.0...v4.1.0) (2023-03-01)


### Features

* fix dequeue log ([#9](https://github.com/MapColonies/mc-priority-queue/issues/9)) ([a336be1](https://github.com/MapColonies/mc-priority-queue/commit/a336be1a3570c628ffce0b44a2ea204e2cd9f980))


### Bug Fixes

* create job response to moved to data types ([#22](https://github.com/MapColonies/mc-priority-queue/issues/22)) ([e10772a](https://github.com/MapColonies/mc-priority-queue/commit/e10772a7128c46be8f53d4887711eeacc996f605))
* require jobId in task response ([#21](https://github.com/MapColonies/mc-priority-queue/issues/21)) ([54ecd8a](https://github.com/MapColonies/mc-priority-queue/commit/54ecd8a43319996c4a0c1faa95ca730e131ae477))
* update task and job types to be the same as in the jobs DB ([#16](https://github.com/MapColonies/mc-priority-queue/issues/16)) ([a130b4a](https://github.com/MapColonies/mc-priority-queue/commit/a130b4a3ce4c52d675d2fe490c470908d606e37f))

### [4.0.5](https://github.com/MapColonies/mc-priority-queue/compare/v4.0.4...v4.0.5) (2023-02-23)


### Bug Fixes

* create job response to moved to data types ([#22](https://github.com/MapColonies/mc-priority-queue/issues/22)) ([e10772a](https://github.com/MapColonies/mc-priority-queue/commit/e10772a7128c46be8f53d4887711eeacc996f605))
* require jobId in task response ([#21](https://github.com/MapColonies/mc-priority-queue/issues/21)) ([54ecd8a](https://github.com/MapColonies/mc-priority-queue/commit/54ecd8a43319996c4a0c1faa95ca730e131ae477))

### [4.0.4](https://github.com/MapColonies/mc-priority-queue/compare/v4.0.3...v4.0.4) (2023-01-17)

### [4.0.3](https://github.com/MapColonies/mc-priority-queue/compare/v4.0.2...v4.0.3) (2023-01-11)

### [4.0.2](https://github.com/MapColonies/mc-priority-queue/compare/v4.0.1...v4.0.2) (2022-11-27)

### [4.0.1](https://github.com/MapColonies/mc-priority-queue/compare/v4.0.0...v4.0.1) (2022-04-24)


### Bug Fixes

* update task and job types to be the same as in the jobs DB ([#16](https://github.com/MapColonies/mc-priority-queue/issues/16)) ([a130b4a](https://github.com/MapColonies/mc-priority-queue/commit/a130b4a3ce4c52d675d2fe490c470908d606e37f))

## [4.0.0](https://github.com/MapColonies/mc-priority-queue/compare/v3.3.0...v4.0.0) (2022-03-01)

### [3.3.1](https://github.com/MapColonies/mc-priority-queue/compare/v3.3.0...v3.3.1) (2022-01-05)

## [3.3.0](https://github.com/MapColonies/mc-priority-queue/compare/v3.1.0...v3.3.0) (2022-01-02)


### Features

* fix dequeue log ([#9](https://github.com/MapColonies/mc-priority-queue/issues/9)) ([a336be1](https://github.com/MapColonies/mc-priority-queue/commit/a336be1a3570c628ffce0b44a2ea204e2cd9f980))

### [3.2.2](https://github.com/MapColonies/mc-priority-queue/compare/v3.2.1...v3.2.2) (2022-01-02)

### [3.2.1](https://github.com/MapColonies/mc-priority-queue/compare/v3.2.0...v3.2.1) (2021-12-29)

## [3.2.0](https://github.com/MapColonies/mc-priority-queue/compare/v3.1.0...v3.2.0) (2021-12-29)


### Features

* fix dequeue log ([#9](https://github.com/MapColonies/mc-priority-queue/issues/9)) ([a336be1](https://github.com/MapColonies/mc-priority-queue/commit/a336be1a3570c628ffce0b44a2ea204e2cd9f980))

## [3.1.0](https://github.com/MapColonies/mc-priority-queue/compare/v3.0.0...v3.1.0) (2021-08-30)

## [3.0.0](https://github.com/MapColonies/mc-priority-queue/compare/v2.0.3...v3.0.0) (2021-08-24)


### Features

* add job and task creation ([#6](https://github.com/MapColonies/mc-priority-queue/issues/6)) ([13ac567](https://github.com/MapColonies/mc-priority-queue/commit/13ac567f3777209bd80ef57d1fbd7b88f0ac79c3))

### [2.0.3](https://github.com/MapColonies/mc-priority-queue/compare/v2.0.2...v2.0.3) (2021-08-19)


### Bug Fixes

* fix package.json git references ([#5](https://github.com/MapColonies/mc-priority-queue/issues/5)) ([56378c4](https://github.com/MapColonies/mc-priority-queue/commit/56378c4dce38548c19e8fcc0c6d4aac7a1407894))

### [2.0.2](https://github.com/MapColonies/ts-npm-package-boilerplate/compare/v2.0.0...v2.0.2) (2021-08-19)


### Bug Fixes

* reduce consume log level to debug ([#4](https://github.com/MapColonies/ts-npm-package-boilerplate/issues/4)) ([ba35a34](https://github.com/MapColonies/ts-npm-package-boilerplate/commit/ba35a349d44046945bd684e34f15603897251ebf))

### [2.0.1](https://github.com/MapColonies/ts-npm-package-boilerplate/compare/v2.0.0...v2.0.1) (2021-08-19)


### Bug Fixes

* reduce consume log level to debug ([#4](https://github.com/MapColonies/ts-npm-package-boilerplate/issues/4)) ([ba35a34](https://github.com/MapColonies/ts-npm-package-boilerplate/commit/ba35a349d44046945bd684e34f15603897251ebf))

## [2.0.0](https://github.com/MapColonies/ts-npm-package-boilerplate/compare/v1.0.1...v2.0.0) (2021-08-10)


### Features

* add job get and update operations ([#3](https://github.com/MapColonies/ts-npm-package-boilerplate/issues/3)) ([bb6275f](https://github.com/MapColonies/ts-npm-package-boilerplate/commit/bb6275f1f7bb0ac5e7f05ed29b13594291ce33f7))

### 1.0.1 (2021-08-05)

### 1.0.1 (2021-08-02)
