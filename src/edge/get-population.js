import {population} from "../util"

export default function EdgeGetPopulation(edge) {
  if (typeof edge === 'number')
    return population(edge)
  else if (edge[0] === edge[1])
    return 2 * EdgeGetPopulation(edge[0])
  else
    return EdgeGetPopulation(edge[0]) + EdgeGetPopulation(edge[1])
}