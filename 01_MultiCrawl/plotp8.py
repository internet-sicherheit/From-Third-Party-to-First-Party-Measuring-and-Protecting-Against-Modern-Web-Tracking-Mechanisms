import pandas as pd
import json
import os
from glob import glob
import statistics
import matplotlib.pyplot as plt
import numpy as np

def plot():
    # Gegebene Daten
    used_rules = np.array([28734, 57464, 86194, 114924, 143654])
    runtime = np.array(
        [11.8, 12.3, 13.0, 13.9, 14.9])
    memory_usage = np.array([8088864.5/1000000, 8220191.5/1000000, 8293447.2/1000000, 8347801.8/1000000, 9615349.4/1000000])
    blocked_urls = np.array([276.493006993007/28734*100, 502.3098591549296/57464*100, 700.3286713286714/86194 * 100, 867.7730496453901/114924 * 100, 1019/143654 * 100])

    # Erstellen der Grafik
    fig, ax1 = plt.subplots()

    # Plot für die linke y-Achse (Runtime und Memory Usage)
    ax1.plot(used_rules, runtime, 'b-', label='Runtime (Seconds)')
    ax1.plot(used_rules, memory_usage, 'y-', label='Memory Usage (GB)')
    ax1.set_xlabel('used rules')
    ax1.set_ylabel('GB | Seconds')
    ax1.tick_params(axis='y', colors='black')
    ax1.legend(loc='upper left')

    # Zweite y-Achse teilen (Blocked URLs)
    ax2 = ax1.twinx()
    ax2.plot(used_rules, blocked_urls, 'r--', label='Blocked URLs per Rule (%)')
    ax2.set_ylabel('Blocked URLs / Rules (in %)')
    ax2.tick_params(axis='y', colors='black')
    ax2.legend(loc='upper right')

    # Layout anpassen und anzeigen
    fig.tight_layout()
    #plt.show()

    plt.savefig(os.path.join(os.getcwd(), 'plots', "p8_runtime_analysis.pdf"), dpi=600,
                transparent=False, bbox_inches='tight', format="pdf")

if __name__ == '__main__':
    plot()