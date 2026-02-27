import * as Comlink from "comlink";
import * as ml from "../ml-algorithms";

const workerObj = {
    kMeansClustering: ml.kMeansClustering,
    detectAnomalies: ml.detectAnomalies,
    calculateProductScores: ml.calculateProductScores,
    rfmAnalysis: ml.rfmAnalysis,
    timeSeriesForecast: ml.timeSeriesForecast,
    dayHourHeatmap: ml.dayHourHeatmap,
    funnelAnalysis: ml.funnelAnalysis,
    abcAnalysis: ml.abcAnalysis,
    cohortAnalysis: ml.cohortAnalysis,
    associationRules: ml.associationRules,
    shippingOptimization: ml.shippingOptimization,
    customerLifetimeValue: ml.customerLifetimeValue,
    priceSensitivity: ml.priceSensitivity,
    correlationMatrix: ml.correlationMatrix
};

export type MLWorker = typeof workerObj;
Comlink.expose(workerObj);
