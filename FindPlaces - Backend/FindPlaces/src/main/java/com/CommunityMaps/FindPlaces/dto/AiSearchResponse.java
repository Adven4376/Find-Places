package com.CommunityMaps.FindPlaces.dto;

import java.util.List;

public class AiSearchResponse {

    private String intent;
    private String explanation;
    private int resultsCount;
    private List<PlaceResponse> places;

    // constructor + getters

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public int getResultsCount() {
        return resultsCount;
    }

    public void setResultsCount(int resultsCount) {
        this.resultsCount = resultsCount;
    }

    public List<PlaceResponse> getPlaces() {
        return places;
    }

    public void setPlaces(List<PlaceResponse> places) {
        this.places = places;
    }


}
