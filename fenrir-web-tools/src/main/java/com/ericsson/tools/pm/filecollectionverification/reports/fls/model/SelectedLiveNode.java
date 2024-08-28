package com.ericsson.tools.pm.filecollectionverification.reports.fls.model;

public class SelectedLiveNode {
    private Network network;
    private Simulation simulation;
    private Node node;

    public Network getNetwork() {
        return network;
    }

    public void setNetwork(final Network network) {
        this.network = network;
    }

    public Simulation getSimulation() {
        return simulation;
    }

    public void setSimulation(final Simulation simulation) {
        this.simulation = simulation;
    }

    public Node getNode() {
        return node;
    }

    public void setNode(final Node node) {
        this.node = node;
    }
}
