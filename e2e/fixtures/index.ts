import { mergeTests } from "@playwright/test";
import {test as apiTest} from "./api.fixture"
import {test as chainTest} from "./chain.fixtures"
import {test as collectionTest} from "./collection.fixture"

export const test = mergeTests(apiTest, chainTest, collectionTest)
export {expect} from '@playwright/test'