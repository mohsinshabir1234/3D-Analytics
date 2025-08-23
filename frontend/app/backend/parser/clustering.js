import {kmeans} from 'ml-kmeans';

export let coordinates_data = [];
export default function clustering() {
  let centers = [
    [1, 2, 1],
    [-1, -1, -1],
    [0,-2,-1],
  ];
    const k = Math.min(3, coordinates_data.length - 1);
  const clusters =  kmeans(coordinates_data, k, { initialization: centers });

  console.log("this is clusters", clusters.centroids);
  console.log("this is centroids", clusters.clusters.slice(0, 50));
}
