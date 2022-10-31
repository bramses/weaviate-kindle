#!/usr/bin/env python
# -*- coding: utf-8 -*-

import collections
import json
import os
import re

BOUNDARY = u"==========\r\n"
DATA_FILE = u"clips.json"
OUTPUT_DIR = u"output"


def get_sections(filename):
    with open(filename, 'rb') as f:
        content = f.read().decode('utf-8')
    content = content.replace(u'\ufeff', u'')
    return content.split(BOUNDARY)


def get_clip(section):
    clip = {}

    lines = [l for l in section.split(u'\r\n') if l]
    if len(lines) != 3:
        return

    if not lines[1].startswith(u'- Your Highlight'):
        return

    clip['book'] = lines[0]
    match = re.search(r'(\d+)-\d+', lines[1])
    if not match:
        return
    position = match.group(0)

    date = lines[1].split(u'Added on ')[-1]

    # extract author from parentheses Zen and the Art of Motorcycle Maintenance (Pirsig, Robert M.) -> Pirsig, Robert M. -- if no parentheses, say "Unknown"
    author = re.search(r'\((.+)\)', clip['book'])
    if author:
        author = author.group(1)
    else:
        author = "Unknown"

    clip['position'] = position
    clip['content'] = lines[2]
    clip['date'] = date
    clip['author'] = author

    return clip


def export_txt(clips):
    """
    Export each book's clips to single text.
    """
    for book in clips:
        lines = []
        for pos in sorted(clips[book]):
            lines.append(clips[book][pos].encode('utf-8'))

        filename = os.path.join(OUTPUT_DIR, u"%s.md" % book)
        with open(filename, 'wb') as f:
            print("Exporting to %s" % filename)
            f.write(b'\n\n---\n\n'.join(lines))


def load_clips():
    """
    Load previous clips from DATA_FILE
    """
    try:
        with open(DATA_FILE, 'rb') as f:
            return json.load(f)
    except (IOError, ValueError):
        return {}


def save_clips(clips):
    """
    Save new clips to DATA_FILE
    """
    with open(DATA_FILE, 'w') as f:
        print("Saving to %s" % DATA_FILE)
        json.dump(clips, f, indent=4)


def convert_clips(clips):
    clippings = []
    for bookName in clips:
        for clip in clips[bookName]:
            new_clip = {}
            new_clip['author'] = clip['author']
            new_clip['clippingText'] = clip['content']
            new_clip['bookTitle'] = clip['book']
            new_clip['location'] = clip['position']
            new_clip['dateAdded'] = clip['date']

            clippings.append(new_clip)
    
    return clippings

def main():
    # load old clips
    clips = collections.defaultdict(dict)
    clips.update(load_clips())

    # extract clips
    sections = get_sections(u'My Clippings.txt')
    TEST_SECTION = False
    for section in sections:
        clip = get_clip(section)

        if TEST_SECTION:
            print(section)
            print(clip)
            print("---")
            TEST_SECTION = False

        if not clip:
            continue

        if clip['book'] not in clips:
            clips[clip['book']] = []

        clips[clip['book']].append(clip)

        # if clip:
        #     clips[clip['book']] += clip

    # remove key with empty value
    clips = {k: v for k, v in clips.items() if v}

    converted_clips = convert_clips(clips)
    clippings_json = { "clippings": converted_clips }

    # save/export clips
    save_clips(clippings_json)
    # export_txt(clips)


if __name__ == '__main__':
    main()
