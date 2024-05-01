import React from "react";
import {
  fireEvent,
  getNodeText,
  screen,
  render,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { fabric } from "fabric";
import Router from "react-router";
import "@testing-library/jest-dom/extend-expect";
import fetchMock from "jest-fetch-mock";
import NewTrackingEditor from "../components/pages/newTrackingEditor/NewTrackingEditor";
import { useLocation } from "react-router-dom/cjs/react-router-dom";
import { parseProcessedPlayers } from "../utils/csvParser";
import {
  mockCSV,
  mockLog,
  mockHomographies,
  mockFieldSize,
} from "./mocks/MockFiles";

beforeEach(() => {
  fetchMock.resetMocks();
  //by default useLocation doesn't return player data and video
  useLocation.mockReturnValue({
    state: {},
  });
});
afterEach(cleanup);

//mock useParams() and useLocation()
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));
jest.spyOn(Router, "useParams").mockReturnValue({ videoName: "mockVideo" });

describe("data fetching", () => {
  it("receives correct annotation", async () => {
    //given
    useLocation.mockReturnValue({
      state: {
        //up to now only necessary to mock processedPlayers
        //should render player 1, 2 in frame0, discard player2 in frame1
        processedPlayers: mockCSV,
        video: undefined,
        ballTracks: undefined,
        homographies: mockHomographies,
        log: mockLog,
        fieldSize: mockFieldSize,
      },
    });
    const logSpy = jest.spyOn(global.console, "log");
    const mockAnnotation = parseProcessedPlayers(mockCSV);

    //when
    render(<NewTrackingEditor />);

    //then
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        "retrieved annotation:",
        mockAnnotation,
      );
    });
  });
});

describe("add player button", () => {
  it("increases length of annotations by 1", () => {
    render(<NewTrackingEditor />);

    //given
    const canvasElement = screen.getByTestId("fabric-canvas");
    const button = screen.getByTestId("add-player-button");
    const initialNumber = canvasElement.getAttribute("annotations");
    expect(initialNumber).toEqual("0");

    //when
    fireEvent.click(button);

    //then
    const updatedNumber = canvasElement.getAttribute("annotations");
    expect(updatedNumber).toEqual("1");
  });

  it("creates a bounding box in the canvas", async () => {
    render(<NewTrackingEditor />);

    //given
    const button = screen.getByTestId("add-player-button");
    const canvasElement = screen.getByTestId("fabric-canvas");
    var JSONCanvas = canvasElement.getAttribute("canvas");
    const initialCanvas = new fabric.Canvas("canvas");
    //retrieve serialized fabric canvas
    initialCanvas.loadFromJSON(
      JSONCanvas,
      initialCanvas.renderAll.bind(initialCanvas),
    );

    //when
    fireEvent.click(button);

    //then
    JSONCanvas = canvasElement.getAttribute("canvas");
    const updatedCanvas = new fabric.Canvas("canvas");
    //retrieve serialized fabric canvas
    updatedCanvas.loadFromJSON(
      JSONCanvas,
      updatedCanvas.renderAll.bind(updatedCanvas),
    );
    expect(initialCanvas.getObjects().length).toEqual(0);
    expect(updatedCanvas.getObjects().length).toEqual(1);
  });

  it("adds a new row in the player sidebar", () => {
    //given
    const { container } = render(<NewTrackingEditor />);
    const button = screen.getByTestId("add-player-button");
    const playerList = container.querySelector(".TrackListList").children[0];
    const initialRowNumber = playerList.childElementCount;

    //when
    fireEvent.click(button);

    //then
    //as the sidebar contains 3 lists(player, team, ball), the playerList is chosen.
    const updatedRowNumber = playerList.childElementCount;
    expect(initialRowNumber).toEqual(0);
    expect(updatedRowNumber).toEqual(1);
  });
});

describe("player sidebar", () => {
  it("displays all players in current frame", async () => {
    //given
    useLocation.mockReturnValue({
      state: {
        //up to now only necessary to mock processedPlayers
        //should render player 1, 2 in frame0, discard player2 in frame1
        processedPlayers: mockCSV,
        video: undefined,
        ballTracks: undefined,
        homographies: mockHomographies,
        log: mockLog,
        fieldSize: mockFieldSize,
      },
    });
    const { container } = render(<NewTrackingEditor />);
    const button = screen.getByTestId("from-annotation");

    //when
    fireEvent.click(button);

    //then
    //as the sidebar contains 3 lists(player, team, ball), the playerList is chosen.
    const playerList = container.querySelector(".TrackListList").children[0];
    expect(playerList.childElementCount).toEqual(2);
    expect(
      getNodeText(playerList.children[0].querySelector(".TrackListItemName")),
    ).toEqual("player1");
    expect(
      getNodeText(playerList.children[1].querySelector(".TrackListItemName")),
    ).toEqual("player2");
  });
});
