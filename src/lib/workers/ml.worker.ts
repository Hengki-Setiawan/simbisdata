import * as Comlink from "comlink";
import * as ml from "../ml-algorithms";
import * as tfEngine from "../tf-engine";

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
    correlationMatrix: ml.correlationMatrix,
    // Deep Learning Models
    deepClustering: tfEngine.deepClustering,
    demandPrediction: tfEngine.demandPrediction,
    lstmForecast: tfEngine.lstmForecast,
    autoencoderAnomaly: tfEngine.autoencoderAnomaly
};

export type MLWorker = typeof workerObj;
Comlink.expose(workerObj);
